const navbar: HTMLDivElement = document.createElement("div");
const images = document.getElementsByTagName("img");

Array.from(images).forEach((i) => {
  i.draggable = false;
});

navbar.innerHTML = `<div id="navbar">
        <h1 onclick="window.location.href='/'" style="cursor: pointer;">Realm of Riches</h1>
        <ul>
          <li><a href="/drop/">Drops</a></li>
          <li><a href="/">Home</a></li>
          <li>
            <a href="/play/" class="cta">Play</a>
          </li>
        </ul>
        <button
          id="navbarToggle"
          onclick="navbarToggle.classList.toggle('toggled'); mobileMenu.classList.toggle('toggled')"
        >
          <div class="burger top"></div>
          <div class="burger mid"></div>
          <div class="burger bot"></div>
        </button>
      </div>

      <div id="mobileMenu">
        <ul>
          <li>
            <div class="overlay"></div>
            <a href="/drop/">Drops</a>
          </li>
          <li>
            <div class="overlay"></div>
            <a href="/">Home</a>
          </li>
          <li>
            <div class="overlay"></div>
            <a href="/play/">Play</a>
          </li>
        </ul>
      </div>`;
document.getElementsByClassName("stuff")[0].append(navbar);
