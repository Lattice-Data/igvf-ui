import HomeTitle from "../components/home-title";

export default function Home() {
  return (
    <div className="@container/home">
      <HomeTitle />
    </div>
  );
}

export async function getServerSideProps() {
  return {
    props: {},
  };
}
