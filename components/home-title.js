/**
 * Display the title of the site as a custom SVG.
 */
export default function HomeTitle() {
  return (
    <>
      <h1 className="sr-only">
        Lattice: Powering data sharing and exploration in the Human Cell Atlas
      </h1>
      <div className="grid min-h-screen place-items-center">
        <div className="aspect-[8/3] w-full bg-[url('/light-banner.png')] bg-cover bg-center bg-no-repeat dark:bg-[url('/dark-banner.png')]" />
      </div>
    </>
  );
}
