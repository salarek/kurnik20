document.getElementById("mainForm").action = `czolko.html`;
function onSelectChange() {
  let game = document.getElementById("game").value;
  console.log(game);
  document.getElementById("mainForm").action = `${game}.html`;
}
