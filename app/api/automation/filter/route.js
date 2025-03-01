import { NextResponse } from "next/server";
import firebase_app from "../../firebase";
import {
  doc,
  getDoc,
  getFirestore,
  getDocs,
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  endAt,
  startAt,
  getCountFromServer,
  documentId,
} from "firebase/firestore";
const jsdom = require("jsdom");

export async function POST(req) {
  try {
    const firestore = getFirestore(firebase_app);
    const request = await req.json();
    console.log(request);
    let q = null;
    if (request.category != "" && request.rate.length > 0) {
      q = query(
        collection(firestore, "softwares"),
        where("fullcategorieslink", "array-contains", request.category),
        where("star_text", "in", request.rate),
        orderBy("nci"),
        startAfter(request.startAfter),
        limit(12)
      );
    } else if (request.rate.length > 0) {
      q = query(
        collection(firestore, "softwares"),
        where("star_text", "in", request.rate),
        orderBy("nci"),
        startAfter(request.startAfter),
        limit(12)
      );
    } else if (request.category != "") {
      q = query(
        collection(firestore, "softwares"),
        where("fullcategorieslink", "array-contains", request.category),
        orderBy("nci"),
        startAfter(request.startAfter),
        limit(12)
      );
    } else {
      q = query(
        collection(firestore, "softwares"),
        orderBy("nci"),
        startAfter(request.startAfter),
        limit(12)
      );
    }
    const snapshot = await getDocs(q);
    let softwares = [];
    for (let doc of snapshot.docs) {
      let temp = doc.data();
      temp.id = doc.id;
      softwares.push(temp);
    }
    return NextResponse.json(
      { softwares: softwares, total: softwares.length },
      { status: 200 }
    );

    // if (request.rate.length > 0 && request.category != "") {
    //   const q = query(
    //     collection(firestore, "softwares"),
    //     where("star_text", "in", request.rate),
    //     where("category", "==", request.category),
    //     orderBy("nci"),
    //     startAfter(request.startAfter),
    //     limit(12)
    //   );
    //   const snapshot = await getDocs(q);
    //   let softwares = [];
    //   for (let doc of snapshot.docs) {
    //     softwares.push(doc.data());
    //   }
    //   return NextResponse.json(
    //     { softwares: softwares, total: softwares.length },
    //     { status: 200 }
    //   );
    // } else if (request.rate.length > 0) {
    //   const q = query(
    //     collection(firestore, "softwares"),
    //     where("star_text", "in", request.rate),
    //     orderBy("nci"),
    //     startAfter(request.startAfter),
    //     limit(12)
    //   );
    //   const snapshot = await getDocs(q);
    //   let softwares = [];
    //   for (let doc of snapshot.docs) {
    //     softwares.push(doc.data());
    //   }
    //   return NextResponse.json(
    //     { softwares: softwares, total: softwares.length },
    //     { status: 200 }
    //   );
    // } else {
    //   let [softwares, ids] = await getSoftwareInfoPerPage(
    //     "https://www.aixploria.com/en/category/" +
    //       request.category +
    //       "/page/" +
    //       request.pageNumber +
    //       "?orderby=alphabetical",
    //     request.category
    //   );

    //   if (ids.length > 0) {
    //     const q = query(
    //       collection(firestore, "softwares"),
    //       where(documentId(), "in", ids)
    //     );
    //     const snapshots = await getDocs(q);
    //     for (let doc of snapshots.docs) {
    //       const data = doc.data();
    //       softwares = softwares.map((item) => {
    //         if (item.id == doc.id && data.reviews > 0) {
    //           return data;
    //         }
    //         return item;
    //       });
    //     }
    //   }

    //   return NextResponse.json(
    //     { softwares: softwares, total: softwares.length },
    //     { status: 200 }
    //   );
    // }
  } catch (e) {
    console.log(e);
    return NextResponse.json(
      { message: "something wrong on the server side!" },
      { status: 500 }
    );
  }
}

const getSoftwareInfoPerPage = async (lnk, category) => {
  const data = await fetch(lnk, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  const temp = await data.text();
  const dom = new jsdom.JSDOM(temp);
  const page = dom.window.document;

  let grid = page.querySelectorAll("div.latest-posts div.post-item");

  let filtered = Array.from(grid).filter((item) => {
    return !item.className.includes("toolday1");
  });
  let ids = [];
  let softwares = filtered.map((cell) => {
    const icon = cell.querySelector("div.post-info div div img").src;
    const name = cell.querySelector("div.post-info div span a").textContent;
    let temp = cell.querySelector("div.post-info div span a").href;
    temp = temp.split("/");
    const nci = temp[temp.length - 2];
    const site = cell.querySelector("a[rel='nofollow noopener']").href;
    const id = nci;
    const star = 0;
    const views = 0;
    const reviews = 0;

    ids.push(id);

    return { id, name, nci, icon, site, category, star, views, reviews };
  });

  return [softwares, ids];
};
