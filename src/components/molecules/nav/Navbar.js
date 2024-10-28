import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { isMobile } from "react-device-detect";
import BurgerMenu from "../burgerMenu/BurgerMenu";
import Link from "next/dist/client/link";
import classes from "./Nav.module.scss";
import Image from "next/image";

export default function Navbar(contentModule) {
  const [isActive, setIsActive] = useState();
  const [mobileView, setMobileView] = useState();
  const handleToggle = () => setIsActive(!isActive);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

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
        <></>
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
              <li className={classes.navLink}>
                <Link href="/" className={`${classes.aLink} fnt16b`}>
                  Home
                </Link>
              </li>
              <li className={classes.navLink}>
                <Link href="/about" className={`${classes.aLink} fnt16b`}>
                  About Us
                </Link>
              </li>
              <li
                className={classes.navLink}
                onMouseEnter={toggleDropdown}
                onMouseLeave={toggleDropdown}
              >
                <Link href="/what-we-do" className={`${classes.aLink} fnt16b`}>
                  What We Do
                </Link>
                {dropdownOpen && (
                  <ul className={`${classes.aDropdown} fnt16b`}>
                    <li className={classes.aDropdownItem}>
                      <Link
                        className={`${classes.aLink} fnt16b`}
                        href="/teacher-education"
                      >
                        Teacher Education
                      </Link>
                    </li>
                    <li className={classes.aDropdownItem}>
                      <Link
                        className={`${classes.aLink} fnt16b`}
                        href="/early-years-education"
                      >
                        Early Years Education
                      </Link>
                    </li>
                    <li className={classes.aDropdownItem}>
                      <Link
                        className={`${classes.aLink} fnt16b`}
                        href="https://assets.ctfassets.net/gm200wyon3t8/KnOvGQO4pyfiBl1wq0Msk/efaac63628c0111aa3ecc28ae51bcb17/comingSoon.pdf"
                        target="_blank"
                      >
                        Community Advocacy
                      </Link>
                    </li>
                  </ul>
                )}
              </li>
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
