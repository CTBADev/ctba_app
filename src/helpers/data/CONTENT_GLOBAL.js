export const GLOBAL_CONTENT = `
query {
  subcomponentImageTitleUrlCard (id:"3VoIrE4sKAO3lYAPIluGn5") {
    title
    url
    customClass
    image {
      title
      url
      width
      height
    }
  }
  componentMenu (id:"27yloRNyTbPfWUCrWu9XKj") {
    title
    customClass
    menuLinksCollection {
      items {
        ... on SubcomponentLink {
          label
          image {
            title
            url
            width
            height
          }
          url
          isExternal
          customClass
        }
      }
    }
  }

  componentFooter (id:"3eyh7pUIL9WfhLQ9BLN970") {
    title
    logo {
      title
      url
      width
      height
    }
    logoCopy {
      ... on SubcomponentCopy {
        title
        copy {
          json
        }
        customClass
      }
    }
    contactCopy {
      ... on SubcomponentCopy {
        title
        copy {
          json
        }
        customClass
      }
    }
    socialMedia {
      title
      ... on ComponentMenu {
        title
        menuLinksCollection {
          items {
            ... on SubcomponentLink {
              label
              url
              isExternal
              customClass
              image {
                title
                url
                width
                height
              }
            }
          }
        }
      }
    }
    quickLinks  {
      title
      ... on ComponentMenu {
        title
        menuLinksCollection {
          items {
            ... on SubcomponentLink {
              label
              url
              isExternal
              customClass
              image {
                title
                url
                width
                height
              }
            }
          }
        }
      }
    }
    copyrightText
    hasOverlay
    image {
      title
      url
      width
      height
    }
  }
}
`;
