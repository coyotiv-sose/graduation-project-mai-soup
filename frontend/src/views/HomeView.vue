<template>
  <div class="bg">
    <main>
      <h1>Porch Reads Club</h1>
      <p>Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
      <p>Quisquam, voluptatum. Quisquam, voluptatum. Quisquam, voluptatum.</p>
      <p>Sed suscipit arcu id nunc fringilla rutrum.</p>
      <a href="#" role="button" class="contrast action-btn">View Libraries</a>
    </main>
    <footer>Maijs Garais, 2023</footer>
  </div>
</template>

<style scoped lang="scss">
.bg {
  background-image: linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)),
    url('/src/assets/landing-bg.webp');
  background-position: center;
  background-size: cover;
  width: 100%;
  height: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  color: white;

  .action-btn {
    font-weight: 700;
    transition: transform 0.4s;

    &:hover {
      transform: translate(0, -5px);
    }
  }

  footer,
  main {
    margin-top: auto;
  }

  p {
    color: white;
  }
}
</style>
