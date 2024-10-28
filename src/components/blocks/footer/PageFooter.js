import Image from "next/image";
import Link from "next/dist/client/link";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import classes from "./Footer.module.scss";

export default function ComponentPageFooter(contentModule) {
  const {
    title,
    logo,
    logoCopy,
    socialMedia,
    contactCopy,
    quickLinks,
    copyrightText,
    image,
    hasOverlay,
  } = contentModule.contentModule;
  return (
    <section className={classes.oFooter}>
      <div className={`${classes.oContainer} container`}>
        <div className={`${classes.oRow} row`}>
          <div className={`${classes.oCol}  col-12 col-md`}>
            <figure className={classes.mLogo}>
              {logo && (
                <Image
                  className={`${classes.aImage}`}
                  src={`${logo?.url}`}
                  alt={`title`}
                  width={logo?.width}
                  height={logo?.height}
                  aria-hidden="true"
                  priority="true"
                />
              )}
            </figure>
            <div className={classes.mLogoCopy}>
              {documentToReactComponents(logoCopy.copy.json)}
            </div>
            <h3 className={`${classes.aTitle} ${classes.socialMedia}`}>
              {socialMedia.title}
            </h3>
            <ul className={`${classes.mFooterNav} ${classes.socialMedia}`}>
              {socialMedia.menuLinksCollection.items.map((link, index) => (
                <li className={classes.navLink} key={index}>
                  <Link
                    href={link.url}
                    className={classes.aLink}
                    target={`${link.isExternal ? "_blank" : "_parent"}`}
                  >
                    {link.image && (
                      <Image
                        className={`${classes.aImage}`}
                        src={`${link.image.url}`}
                        alt={`title`}
                        width={link.image.width}
                        height={link.image.height}
                        aria-hidden="true"
                        style={{ objectFit: "cover" }}
                        priority="true"
                      />
                    )}
                    {!link.image && (
                      <span className={`${classes.aText} fnt13f`}>
                        {link.label}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className={`${classes.oCol} col-12 col-md`}>
            <h3 className={`${classes.aTitle} fnt18f`}>{contactCopy.title}</h3>
            <div className={`${classes.mCopy} ${classes.contactCopy} fnt12`}>
              {documentToReactComponents(contactCopy.copy.json)}
            </div>
          </div>
          <div className={`${classes.oCol}  col-12 col-md`}>
            <h3 className={`${classes.aTitle} fnt18f`}>{quickLinks.title}</h3>
            <ul className={`${classes.mFooterNav} ${classes.quickLinks}`}>
              {quickLinks.menuLinksCollection.items.map((link, index) => (
                <li className={classes.navLink} key={index}>
                  <Link
                    href={link.url}
                    className={classes.aLink}
                    target={`${link.isExternal ? "_blank" : "_parent"}`}
                  >
                    {link.image && (
                      <Image
                        className={`${classes.aImage}`}
                        src={`https:${logo?.url}`}
                        alt={`title`}
                        width={logo?.image.width}
                        height={logo?.image.height}
                        aria-hidden="true"
                        style={{ objectFit: "cover" }}
                        priority="true"
                      />
                    )}
                    {!link.imag && (
                      <span className={`${classes.aText} fnt13f`}>
                        {link.label}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div
        className={`${classes.aBackgroundImage}`}
        style={{
          backgroundImage: `url(${image.url})`,
        }}
      >
        <div className={`${classes.copyright}`}>{copyrightText}</div>
      </div>
    </section>
  );
}
