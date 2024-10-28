export const HOME_CONTENT = `
query {  
  homepageCollection (limit: 10) {
    items {
      title
      slug
    }
  }
}
`;

export const HOME_SLUG = `
query {
    homepageCollection{
    items {
      title
      slug
    }
  }
}
`;
