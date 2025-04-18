import FileUpload from './components/FileUpload';
export default function Home() {
  return (
    <div className="flex flex-col bg-gradient-to-tr from-black/10 to-purple-600/10" style={{ minHeight: '81vh' }}>
      <main className="flex-1 flex items-center justify-center px-4 py-10">

        <div className="max-w-3xl w-full space-y-6 text-center">
          <h1 className="typewriter text-[5vw] md:text-5xl font-extrabold text-cyan-500">
            Find the Optimal Path
          </h1>
          <p className="text-white text-shadow-blue-950 text-lg md:text-xl">
            Upload an image of a map or graph to analyze and calculate the best path.
          </p>
          <FileUpload />
        </div>
      </main>
    </div>
  );
}
