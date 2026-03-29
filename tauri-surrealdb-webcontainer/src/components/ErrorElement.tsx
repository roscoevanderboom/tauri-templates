import { useRouteError, isRouteErrorResponse } from "react-router";

export default function ErrorPage() {
  const error = useRouteError();
  console.error(error);

  let errorMessage: string;
  let errorDetails: string | null = null;

  if (isRouteErrorResponse(error)) {
    // page threw an ErrorResponse (e.g. 404)
    errorMessage = error.statusText || "Unknown Error";
    errorDetails = `${error.status} ${error.statusText}`;
  } else if (error instanceof Error) {
    // page threw an Error
    errorMessage = "Unexpected Application Error";
    errorDetails = error.message;
    // Specific check for the WebContainer issue to give better guidance
    if (error.message.includes("WebContainer")) {
      errorMessage = "WebContainer Failed to Start";
      errorDetails =
        "Make sure you are running this in a compatible environment (requires Cross-Origin Isolation headers). \n\n" +
        error.message;
    }
  } else if (typeof error === "string") {
    errorMessage = "Unexpected Error";
    errorDetails = error;
  } else {
    errorMessage = "Unknown Error";
    errorDetails = "An unknown error has occurred.";
  }

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-[radial-gradient(circle_at_center,#2a2a2a_0%,#1a1a1a_100%)] text-white p-8 box-border font-sans text-center">
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes custom-bounce {
            0%, 20%, 50%, 80%, 100% {transform: translateY(0);}
            40% {transform: translateY(-20px);}
            60% {transform: translateY(-10px);}
          }
          .animate-fade-in {
            animation: fadeIn 0.5s ease-out;
          }
          .animate-custom-bounce {
            animation: custom-bounce 2s infinite;
          }
        `}
      </style>
      <div className="bg-white/5 backdrop-blur-[10px] border border-white/10 p-12 rounded-[20px] shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] max-w-[600px] w-full animate-fade-in">
        <span className="text-[4rem] mb-4 block animate-custom-bounce">⚠️</span>
        <h1 className="text-[2.5rem] m-[0_0_1rem] bg-gradient-to-r from-[#ff6b6b] to-[#feca57] bg-clip-text text-transparent font-extrabold">
          {errorMessage}
        </h1>
        <p className="text-[1.1rem] text-[#a0a0a0] mb-8 leading-relaxed">
          We're sorry, but something went wrong while loading the application.
        </p>

        {errorDetails && (
          <div className="bg-black/30 p-4 rounded-lg font-mono text-[0.9rem] text-[#ff6b6b] text-left mb-8 overflow-x-auto border border-[#ff6b6b33]">
            {errorDetails}
          </div>
        )}

        <button
          className="bg-gradient-to-r from-[#4facfe] to-[#00f2fe] text-[#1a1a1a] border-none py-4 px-8 text-[1.1rem] font-semibold rounded-[50px] cursor-pointer transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_5px_15px_rgba(79,172,254,0.4)] no-underline inline-block"
          onClick={() => window.location.reload()}
        >
          Reload Application
        </button>
      </div>
    </div>
  );
}
