// Tema do painel: automático (segue o sistema), escuro ou claro, lembrado neste navegador.
// É um script comum, e não um módulo, carregado no <head>: assim o tema salvo é aplicado antes de
// a página aparecer. Módulos só rodam depois que o HTML inteiro foi lido, e a página piscaria clara.
(() => {
  const TEMAS = ["automatico", "escuro", "claro"];
  const NOMES = { automatico: "Automático", escuro: "Escuro", claro: "Claro" };
  const raiz = document.documentElement;

  // localStorage pode falhar (janela anônima, armazenamento bloqueado): aí o tema só não é lembrado.
  const lerSalvo = () => { try { return localStorage.getItem("tema"); } catch { return null; } };
  const salvar = (tema) => { try { localStorage.setItem("tema", tema); } catch { /* sem memória, sem problema */ } };

  /** "claro"/"escuro" forçam a color-scheme (styles.css); "automatico" deixa o sistema decidir. */
  function aplicar(tema) {
    if (tema === "automatico") delete raiz.dataset.tema;
    else raiz.dataset.tema = tema;
  }

  let atual = TEMAS.includes(lerSalvo()) ? lerSalvo() : "automatico";
  aplicar(atual);

  document.addEventListener("DOMContentLoaded", () => {
    const botao = document.getElementById("tema");
    const rotular = () => {
      botao.textContent = `Tema: ${NOMES[atual]}`;
      botao.title = "Alterna entre automático (segue o sistema), escuro e claro";
    };
    rotular();
    botao.addEventListener("click", () => {
      atual = TEMAS[(TEMAS.indexOf(atual) + 1) % TEMAS.length];
      aplicar(atual);
      salvar(atual);
      rotular();
    });
  });
})();
