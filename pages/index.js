// node_modules
// components
import HomeTitle from "../components/home-title";
// lib
import { getCachedDataFetch } from "../lib/cache";
import FetchRequest from "../lib/fetch-request";

/**
 * Key for the cache that stores the statistics for the home page.
 */
const STATISTICS_CACHE_KEY = "home-page-statistics";

/**
 * Time-to-live for the cache that stores the statistics for the home page.
 */
const STATISTICS_CACHE_TTL = 15 * 60;

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

/**
 * Fetch the statistics for the home page for copying to the cache.
 *
 * @param {string} cookie - Cookie to use for the request to the data provider
 * @returns {string} JSON string with the statistics for the home page
 */
async function fetchHomePageStatistics(cookie) {
  const request = new FetchRequest({ cookie: cookie || undefined });
  const processedResults = (
    await request.getObject("/search/?type=AnalysisSet&status=released&limit=0")
  ).optional();
  const predictionsResults = (
    await request.getObject(
      "/search/?type=PredictionSet&status=released&limit=0"
    )
  ).optional();
  const rawResults = (
    await request.getObject(
      "/search/?type=MeasurementSet&status=released&limit=0"
    )
  ).optional();

  return {
    processedCount: processedResults?.total || 0,
    predictionsCount: predictionsResults?.total || 0,
    rawCount: rawResults?.total || 0,
  };
}

export async function getServerSideProps({ req }) {
  const { processedCount, predictionsCount, rawCount } =
    await getCachedDataFetch(
      STATISTICS_CACHE_KEY,
      async () => fetchHomePageStatistics(req.headers.cookie || ""),
      STATISTICS_CACHE_TTL
    );

  return {
    props: {
      processedCount,
      predictionsCount,
      rawCount,
    },
  };
}
