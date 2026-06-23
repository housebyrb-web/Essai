const OPEN_CLASS = "is-menu-open";

export function initNavigation(documentRef = document) {
  const toggle = documentRef.querySelector(".navigation__toggle");
  const links = documentRef.querySelectorAll(".navigation__links a");

  if (!toggle) {
    return;
  }

  toggle.addEventListener("click", () => toggleMenu(documentRef, toggle));
  links.forEach((link) => link.addEventListener("click", () => closeMenu(documentRef, toggle)));
}

function toggleMenu(documentRef, toggle) {
  const isOpen = documentRef.body.classList.toggle(OPEN_CLASS);
  toggle.setAttribute("aria-expanded", String(isOpen));
}

function closeMenu(documentRef, toggle) {
  documentRef.body.classList.remove(OPEN_CLASS);
  toggle.setAttribute("aria-expanded", "false");
}
