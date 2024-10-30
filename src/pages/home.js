const {
  C_DELIVERY_KEY,
  C_GRAPHQL_URL,
} = require("../helpers/contentful-config");

const { HOME_CONTENT } = require("../helpers/data/CONTENT_HOME");

export async function getStaticProps() {
  const result = await fetch(C_GRAPHQL_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${C_DELIVERY_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: HOME_CONTENT,
    }),
  });

  if (!result.ok) {
    console.error(result);
    return {};
  }

  const { data } = await result.json();
  const homepage = data;

  return {
    props: {
      homepage,
    },
  };
}

export default function Home({ homepage }) {
  const { title } = homepage.homepageCollection.items[0];
  return (
    <div className="anchor" id="top">
      <h1>{title}</h1>
    </div>
  );
}
