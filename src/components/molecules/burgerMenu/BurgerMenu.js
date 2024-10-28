import classes from "./BurgerMenu.module.scss";

export default function BurgerMenu({ isActive, handleToggle }) {
  return (
    <div
      onClick={handleToggle}
      className={`${classes.mBurger} ${
        isActive ? `${classes.burgerOn}` : `${classes.burgerOff}`
      }`}
    >
      <span className={`${classes.aBar} ${classes.barOne}`} />
      <span className={`${classes.aBar} ${classes.barTwo}`} />
      <span className={`${classes.aBar} ${classes.barThree}`} />
    </div>
  );
}
