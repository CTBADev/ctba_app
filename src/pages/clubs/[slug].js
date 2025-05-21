import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { BLOCKS, INLINES } from "@contentful/rich-text-types";
import Image from "next/image";
import {
  getContentfulClient,
  getClubBySlug,
  getClubs,
} from "../../lib/contentful";
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
  const clubs = await getClubs();

  // Filter out items without slugs and create paths
  const paths = clubs
    .filter((club) => club.slug) // Ensure slug exists
    .map((club) => ({
      params: { slug: club.slug },
    }));

  return {
    paths,
    fallback: "blocking",
  };
}

export async function getStaticProps({ params }) {
  const club = await getClubBySlug(params.slug);

  if (!club) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      club,
    },
    revalidate: 60, // Revalidate every minute
  };
}

export default function ClubProfile({ club }) {
  const { name, shortName, logo, description, website, email, phone, address } =
    club;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        {logo && (
          <div className={styles.logoContainer}>
            <Image
              src={logo}
              alt={name}
              width={200}
              height={200}
              className={styles.logo}
            />
          </div>
        )}
        <div className={styles.headerContent}>
          <h1 className={styles.title}>{name}</h1>
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
          {address && (
            <div className={styles.location}>
              <h3>Location</h3>
              <p>{address}</p>
            </div>
          )}

          <div className={styles.contact}>
            <h3>Contact</h3>
            {email && <p>Email: {email}</p>}
            {phone && <p>Phone: {phone}</p>}
            {website && (
              <p>
                Website:{" "}
                <a
                  href={website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.link}
                >
                  {website}
                </a>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
