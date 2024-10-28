export const PAGE_CONTENT = `
  query GetPage($slug: String!) {
    pagePageCollection(where: { slug: $slug }, limit: 1) {
      items {
        title
        slug
        copy {
          json
        }
      }
    }
  }
`;

export const PAGE_SLUG = `
query {
  pagePageCollection {
    items {
      slug
    }
  }
}
`;
