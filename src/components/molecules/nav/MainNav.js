import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { isMobile } from "react-device-detect";
import BurgerMenu from "../burgerMenu/BurgerMenu";
import Link from "next/dist/client/link";
import classes from "./Nav.module.scss";
import Image from "next/image";

export default function MainNav(contentModule) {
  const [isActive, setIsActive] = useState();
  const [mobileView, setMobileView] = useState();
  const handleToggle = () => setIsActive(!isActive);
  gsap.registerPlugin(ScrollTrigger);
  const navbarRef = useRef(null);

  useEffect(() => {
    setMobileView(isMobile);

    const showNav = gsap
      .fromTo(
        navbarRef.current,
        {
          opacity: 0,
        },
        {
          opacity: 1,
          duration: 0.4,
        }
      )
      .progress(1);
    ScrollTrigger.create({
      start: "top top",
      end: "max",
      onUpdate: (self) => {
        self.direction === -1 ? showNav.play() : showNav.reverse();
      },
    });
  }, []);

  const { menuLinksCollection } = contentModule.contentModule;
  const menuLinks = menuLinksCollection.items;
  const logo = contentModule.logo;
  return (
    <nav className={classes.oNavMain} ref={navbarRef}>
      <span
        onClick={handleToggle}
        className={`${classes.burgerWrapper} ${
          isActive ? `${classes.navOpen}` : `${classes.navClosed}`
        }`}
      >
        <BurgerMenu />
      </span>
      {mobileView ? (
        <div
          className={`${classes.mNavMobile} ${
            isActive ? `${classes.navOpen}` : `${classes.navClosed}`
          }`}
        >
          <div onClick={handleToggle} className={classes.mNavBurger}>
            <BurgerMenu handleToggle={handleToggle} isActive={isActive} />
          </div>
          <div className={`${classes.mDonateButton} ${classes.mobileLink}`}>
            <a
              className={`${classes.aBtn} aBtn`}
              href="https://www.payfast.co.za/donate/go/centreforcreativeeducation"
              target="_blank"
            >
              Donate Now
            </a>
          </div>
          <ul className={classes.mMenu}>
            {menuLinks.map((link, index) => (
              <li className={classes.navLink} key={index}>
                <Link
                  onClick={handleToggle}
                  href={link.url}
                  className={classes.aLink}
                  target={`${link.isExternal ? "_blank" : "_parent"}`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className={`${classes.mNavDesktop}`}>
          <div className={classes.mMenu}>
            <figure className={`${classes.mLogo}`}>
              <Link href={logo.url}>
                <Image
                  className={`${classes.aLogo}`}
                  src={`${logo?.image?.url}`}
                  alt={`title`}
                  width={logo?.image.width}
                  height={logo?.image.height}
                  aria-hidden="true"
                  priority="true"
                  style={{ objectFit: "cover" }}
                />
              </Link>
            </figure>
            <ul className={classes.mMenuList}>
              {menuLinks.map((link, index) => (
                <li className={classes.navLink} key={index}>
                  <Link
                    href={link.url}
                    className={`${classes.aLink} fnt16b`}
                    target={`${link.isExternal ? "_blank" : "_parent"}`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className={`${classes.mDonateButton}`}>
            <a
              className={`${classes.aBtn} aBtn`}
              href="https://www.payfast.co.za/donate/go/centreforcreativeeducation"
              target="_blank"
            >
              Donate Now
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
