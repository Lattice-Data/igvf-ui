// node_modules
// components
import HomeTitle from "../components/home-title";

export default function Home() {
  return (
    <div className="@container/home">
      <HomeTitle />
      <p className="my-8">
        The Impact of Genomic Variation on Function Consortium (
        <a href="https://igvf.org" target="_blank" rel="noopener noreferrer">
          IGVF
        </a>
        ) is funded by the{" "}
        <a
          href="https://www.genome.gov/about-nhgri/Organization"
          target="_blank"
          rel="noopener noreferrer"
        >
          NHGRI
        </a>{" "}
        with the aim of understanding how genomic variation affects genome
        function and phenotype. This data portal serves as the repository for
        all of the research data generated from this effort from raw sequences
        to analyzed effects including software and predictive models.
      </p>
    </div>
  );
}

export async function getServerSideProps() {
  return {
    props: {},
  };
}
