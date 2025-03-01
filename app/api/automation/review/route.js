import { NextResponse } from "next/server";
import firebase_app from "../../firebase";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  doc,
  getDoc,
  getFirestore,
  setDoc,
  collection,
  addDoc,
  updateDoc,
  query,
  getDocs,
  where,
} from "firebase/firestore";
import {
  EmailAuthCredential,
  EmailAuthProvider,
  getAuth,
  reauthenticateWithCredential,
  signInWithEmailAndPassword,
  updatePassword,
} from "firebase/auth";
import { verify } from "jsonwebtoken";

export async function GET(req, res) {
  try {
    const firestore = getFirestore(firebase_app);
    const id = req.url.split("=").pop();
    const q = query(
      collection(firestore, "reviews"),
      where("soft_id", "==", id)
    );
    const querySnapshot = await getDocs(q);
    let data = [];
    querySnapshot.forEach((doc) => {
      data.push(doc.data());
    });
    return NextResponse.json({ data: data }, { status: 200 });
  } catch (e) {
    console.log(e);
    return NextResponse.json(
      { message: "something wrong on the server side!" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const firestore = getFirestore(firebase_app);
    const auth = getAuth(firebase_app);
    let review = await req.json();

    const prompt = `We have this comment with title (${review.title}) and the comment (${review.comment}). Are both title and comment appropriate, not offensive, and a proper sentence or paragraph? please only answer yes or no.`;
    const allow = await gemini(prompt);
    if (allow.toLowerCase() != "yes") {
      return NextResponse.json(
        { message: "Inappropriate comment" },
        { status: 406 }
      );
    }
    try {
      const decode = verify(review.username, process.env.secret);

      const userCredential = await signInWithEmailAndPassword(
        auth,
        decode.email,
        decode.password
      );
      const user = userCredential.user;

      let q = query(
        collection(firestore, "reviews"),
        where("userid", "==", user.uid),
        where("soft_id", "==", review.soft_id)
      );

      const reviewsnap = await getDocs(q);
      if (reviewsnap.size > 0) {
        return NextResponse.json(
          { message: "User already made a review for this tool!" },
          { status: 403 }
        );
      }

      review["username"] = user.displayName;
      review["occupation"] = user.photoURL.split("!បំបែក!")[0];
      review["photoURL"] = user.photoURL.split("!បំបែក!")[1];
      review["userid"] = user.uid;

      var result = await addDoc(collection(firestore, "reviews"), review);
      q = query(
        collection(firestore, "reviews"),
        where("soft_id", "==", review.soft_id)
      );
      const querySnapshot = await getDocs(q);
      let data = [];
      querySnapshot.forEach((doc) => {
        const temp = doc.data();
        data.push(parseInt(temp.experience) + parseInt(temp.recommend));
      });

      const star =
        data.reduce((partialSum, a) => partialSum + a, 0) / (data.length * 4);
      const start_text = Math.floor(star).toString();
      const soft_res = await updateDoc(
        doc(firestore, "softwares", `${review.soft_id}`),
        {
          star: parseFloat(star.toFixed(2)),
          star_text: start_text,
          reviews: data.length,
        }
      );

      return NextResponse.json({ id: result.id }, { status: 200 });
    } catch (e) {
      console.log(e);
      return NextResponse.json({ message: "Session Expire" }, { status: 405 });
    }
  } catch (e) {
    console.log(e);
    return NextResponse.json(
      { message: "something wrong on the server side!" },
      { status: 500 }
    );
  }
}

const gemini = async (pmt) => {
  try {
    const genAI = new GoogleGenerativeAI(process.env.geminiKey);

    const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });

    const prompt = pmt;

    const result = await model.generateContent(pmt);
    const response = await result.response;
    const text = response.text();

    return text.trim();
  } catch (e) {
    console.log(e);
    return "no";
  }
};
