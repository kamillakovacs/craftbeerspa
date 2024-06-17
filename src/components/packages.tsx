import React, { FC, memo } from "react";

import Accordion from "../components/accordion";

const Packages: FC = () => {
  return (
    <article className="Packages">
      <span className="Packages__title">Our Experience Options</span>
      <Accordion
        title={"Experience 1"}
        subTitle={"Infra Sauna, Beer Spa, Relaxing Straw Bed, Snacks, Unlimited Beer, Swedish Massage"}
        description={
          "Description of spa product Description of spa product Description of spa product Description of spa product Description of spa product Description of spa product"
        }
      />

      <Accordion
        title={"Experience 2"}
        subTitle={"Infra Sauna, Beer Spa, Relaxing Straw Bed, Snacks, Unlimited Beer"}
        description={
          "Description of spa product Description of spa product Description of spa product Description of spa product Description of spa product Description of spa product"
        }
      />
      <Accordion
        title={"Experience 3"}
        subTitle={"Beer Spa, Relaxing Straw Bed, Unlimited Beer, Swedish Massage"}
        description={
          "Description of spa product Description of spa product Description of spa product Description of spa product Description of spa product Description of spa product"
        }
      />
      <Accordion
        title={"Experience 4"}
        subTitle={"Beer Spa, Relaxing Straw Bed, Unlimited Beer"}
        description={
          "Description of spa product Description of spa product Description of spa product Description of spa product Description of spa product Description of spa product"
        }
      />
    </article>
  );
};

export default memo(Packages);
