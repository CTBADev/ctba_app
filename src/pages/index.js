import { useRouter } from "next/router";
import { useEffect } from "react";

/**
 * Initial page load to access users browser information
 *
 * @returns {JSX.Element}
 * @constructor
 */
export default function Index() {
  const router = useRouter();

  useEffect(() => {
    sessionStorage.setItem("af_params", router.asPath);

    router
      .replace({
        pathname: "/home",
      })
      .then();
  }, [router]);

  return <nav />;
}
