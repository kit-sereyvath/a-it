import React from "react";

export default function Stars({ number }) {
  return (
    <div className="flex text-[#F3B146] relative z-10 pr-2 text-sm xm:text-lg place-items-center">
      {[...Array(number)].map((value, index) => {
        return (
          <React.Fragment key={index}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 36 36"
            >
              <path
                fill="currentColor"
                d="M34 16.78a2.22 2.22 0 0 0-1.29-4l-9-.34a.23.23 0 0 1-.2-.15l-3.11-8.4a2.22 2.22 0 0 0-4.17 0l-3.1 8.43a.23.23 0 0 1-.2.15l-9 .34a2.22 2.22 0 0 0-1.29 4l7.06 5.55a.23.23 0 0 1 .08.24l-2.43 8.61a2.22 2.22 0 0 0 3.38 2.45l7.46-5a.22.22 0 0 1 .25 0l7.46 5a2.2 2.2 0 0 0 2.55 0a2.2 2.2 0 0 0 .83-2.4l-2.45-8.64a.22.22 0 0 1 .08-.24Z"
                className="clr-i-solid clr-i-solid-path-1"
              />
              <path fill="none" d="M0 0h36v36H0z" />
            </svg>
          </React.Fragment>
        );
      })}
      <p className="text-bgray text-sm sm:text-[1.05rem]">(2134)</p>
    </div>
  );
}
