import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { BLOCKS, INLINES } from "@contentful/rich-text-types";
import Image from "next/image";
import { getClient } from "../../lib/contentful";
import styles from "./ClubProfile.module.css";

const richTextOptions = {
  renderNode: {
    [BLOCKS.HEADING_1]: (node, children) => (
      <h1 className={styles.heading1}>{children}</h1>
    ),
    [BLOCKS.HEADING_2]: (node, children) => (
      <h2 className={styles.heading2}>{children}</h2>
    ),
    [BLOCKS.HEADING_3]: (node, children) => (
      <h3 className={styles.heading3}>{children}</h3>
    ),
    [BLOCKS.PARAGRAPH]: (node, children) => (
      <p className={styles.paragraph}>{children}</p>
    ),
    [BLOCKS.UL_LIST]: (node, children) => (
      <ul className={styles.ul}>{children}</ul>
    ),
    [BLOCKS.OL_LIST]: (node, children) => (
      <ol className={styles.ol}>{children}</ol>
    ),
    [BLOCKS.LIST_ITEM]: (node, children) => (
      <li className={styles.li}>{children}</li>
    ),
    [BLOCKS.QUOTE]: (node, children) => (
      <blockquote className={styles.quote}>{children}</blockquote>
    ),
    [INLINES.HYPERLINK]: (node, children) => (
      <a
        href={node.data.uri}
        className={styles.link}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
  },
};

export async function getStaticPaths() {
  const client = getClient();
  const response = await client.getEntries({
    content_type: "club",
    select: ["fields.slug", "fields.clubName"], // Select both slug and clubName
  });

  // Filter out items without slugs and create paths
  const paths = response.items
    .filter((item) => item.fields && item.fields.slug) // Ensure slug exists
    .map((item) => ({
      params: { slug: item.fields.slug },
    }));

  return {
    paths,
    fallback: "blocking",
  };
}

export async function getStaticProps({ params }) {
  const client = getClient();
  const response = await client.getEntries({
    content_type: "club",
    "fields.slug": params.slug,
    include: 2, // Include linked entries (teams)
  });

  if (!response.items.length) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      club: response.items[0],
    },
    revalidate: 60, // Revalidate every minute
  };
}

export default function ClubProfile({ club }) {
  const { clubName, shortName, logo, description, location, contact, teams } =
    club.fields;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        {logo && (
          <div className={styles.logoContainer}>
            <Image
              src={logo.fields.file.url}
              alt={clubName}
              width={200}
              height={200}
              className={styles.logo}
            />
          </div>
        )}
        <div className={styles.headerContent}>
          <h1 className={styles.title}>{clubName}</h1>
          {shortName && <h2 className={styles.subtitle}>{shortName}</h2>}
        </div>
      </div>

      <div className={styles.content}>
        {description && (
          <div className={styles.description}>
            {documentToReactComponents(description, richTextOptions)}
          </div>
        )}

        <div className={styles.details}>
          {location && (
            <div className={styles.location}>
              <h3>Location</h3>
              <p>
                {location.lat}, {location.lon}
              </p>
            </div>
          )}

          {contact && (
            <div className={styles.contact}>
              <h3>Contact</h3>
              <p>{contact}</p>
            </div>
          )}
        </div>

        {teams && teams.length > 0 && (
          <div className={styles.teams}>
            <h3>Teams</h3>
            <div className={styles.teamGrid}>
              {teams.map((team) => (
                <div key={team.sys.id} className={styles.teamCard}>
                  <h4>{team.fields.teamName}</h4>
                  {team.fields.ageGroup && (
                    <p className={styles.ageGroup}>{team.fields.ageGroup}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
