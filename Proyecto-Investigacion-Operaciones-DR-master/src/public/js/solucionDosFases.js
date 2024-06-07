document.addEventListener("DOMContentLoaded", () => {
  math.config({
    number: "Fraction", // Usar fracciones en lugar de números decimales
  });

  let matricesJSON = {
    matrices: [],
  };

  // llamados al DOM
  let divContenedorProblema = document.querySelector(".problema");
  let divContenedorBotones = document.querySelector('#botonInicio')
  
  //Variables Globales 
  let _totalVariables,
    _constraintVariables,
    _artificialV,
    _slackV,
    _excessV,
    _objectiveFunction,
    _constraintResults,
    _constraints,
  _maximize = false;

  const mostrarFuncionObjetivo = (data) => {
    let funcionObjetivo = data[0];
    let tamanoFuncionObjetivo = funcionObjetivo.length;
    let ultimaPosicion = tamanoFuncionObjetivo - 1;
    let tipoFuncion = funcionObjetivo[ultimaPosicion];
    let html = "";

    for (let i = 0; i < ultimaPosicion; i++) {
      if (i === 0) {
        html += `
        <h2 class="miRojo">
          Función Objetivo<br>
        </h2>
        <p>
          <span class="miRojo fs-3">${tipoFuncion}&nbsp;</span>
          <span class="miRojo fs-1">Z</span>
          <span class="miRojo fs-3">= &nbsp;</span>
          <span class="fs-1">${funcionObjetivo[i]}</span>
          <span class="miRojo fs-4">X${i + 1}&nbsp;</span>
          <span class="miRojo fs-3">+&nbsp;</span>
      `;
      } else {
        if (i === ultimaPosicion - 1) {
          html += `
        <span class="fs-1">${funcionObjetivo[i]}</span>
        <span class="miRojo fs-4">X${i + 1}&nbsp;</span>
        </p>
        <h2 class="miRojo">
          S.A<br>
        </h2>
        `;
        } else {
          html += `
        <span class="fs-1">${funcionObjetivo[i]}</span>
        <span class="miRojo fs-4">X${i + 1}&nbsp;</span>
        <span class="miRojo fs-3">+&nbsp;</span>
        `;
        }
      }
    }
    divContenedorProblema.innerHTML += html;
  };

  const restriccionObligatoria = (data) => {
    let tamanoData = data.length;
    let restriccion = data[1];
    let tamanoRestriccion = restriccion.length;
    let ultimaPosicion = tamanoRestriccion - 1;
    let html = "";

    for (let i = 0; i < ultimaPosicion; i++) {
      if (i === 0) {
        html += `
                 <p>
                  <span class="miRojo fs-1">${tamanoData})&nbsp</span>
                  <span class="miRojo fs-2">X${i + 1}&nbsp;</span>
                  <span class="miRojo fs-3">,&nbsp;</span>
              `;
      } else {
        if (i === ultimaPosicion - 1) {
          html += `
        <span class="miRojo fs-1">>=</span>
        <span class="fs-1">0</span>
        </p>
        `;
        } else {
          html += `
          <span class="miRojo fs-2">X${i + 1}&nbsp;</span>
          <span class="miRojo fs-3">,&nbsp;</span>
        `;
        }
      }
    }
    divContenedorProblema.innerHTML += html;
  };

  const mostrarRestricciones = (data) => {
    let restriccion = data[1];
    let tamanoRestriccion = restriccion.length;
    let ultimaPosicion = tamanoRestriccion - 1;

    for (let fila = 1; fila < data.length; fila++) {
      let html = "";
      let renglon = data[fila];
      let signo = renglon[ultimaPosicion];
      for (let columna = 0; columna < ultimaPosicion; columna++) {
        let valor = renglon[columna];
        let positivoNegativo = "+";

        if (valor.includes("-")) {
          positivoNegativo = "-";
          valor = valor.replace("-", "");
        }

        if (columna === 0) {
          if (positivoNegativo == "-") {
            html += `
                 <p>
                  <span class="miRojo fs-1">${fila})&nbsp</span>
                  <span class="miRojo fs-1">${positivoNegativo}</span>
                  <span class="fs-1">${valor}</span>
                  <span class="miRojo fs-4">X${columna + 1}&nbsp;</span>
                `;
          } else {
            html += `
                  <span class="miRojo fs-1">${fila})&nbsp</span>
                  <span class="fs-1">${valor}</span>
                  <span class="miRojo fs-4">X${columna + 1}&nbsp;</span>
                `;
          }
        } else {
          if (columna == ultimaPosicion - 1) {
            html += `
                  <span class="miRojo fs-1">${signo}&nbsp;</span>
                  <span class="fs-1">${valor}</span>
                  </p>
                  `;
          } else {
            html += `
                  <span class="miRojo fs-1">${positivoNegativo}</span>
                  <span class="fs-1">${valor}</span>
                  <span class="miRojo fs-4">X${columna + 1}&nbsp;</span>
                `;
          }
        }
      }
      divContenedorProblema.innerHTML += html;
    }

    restriccionObligatoria(data);
  };

  const mostrarProblema = (data) => {
    mostrarFuncionObjetivo(data);
    mostrarRestricciones(data);
  };

  const initializeVariables = (data) => {
    _maximize = isMaximize(data);
    _constraintResults = extractConstraintResults(data);
    _constraintVariables = extractConstraintVariables(data);
    _constraints = extractConstraints(data);
    _totalVariables = getTotalVariables(data);
    _objectiveFunction = extractObjectiveFunction(data);

    const counts = countVariables(data, _constraints);

    _slackV = counts.slackV;
    _excessV = counts.excessV;
    _artificialV = counts.artificialV;
  };

  const alert = () => {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger",
      },
      buttonsStyling: false,
    });
    swalWithBootstrapButtons
      .fire({
        title: "El problema de programacion lineal no se puede resolver",
        text: "Quiere digitar otro problema usando el metodo dos fases?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Si, digitemo otro problema!",
        cancelButtonText: "No, volver al menu principal!",
        reverseButtons: true,
        allowOutsideClick: false,
      })
      .then((result) => {
        if (result.isConfirmed) {
          swalWithBootstrapButtons.fire({
            title: "Volviendo..",
            icon: "Aceptar",
            allowOutsideClick: false,
            willClose: () => {
              window.location.href = "/metodoDosFases";
            },
          });
        } else if (
          /* Read more about handling dismissals below */
          result.dismiss === Swal.DismissReason.cancel
        ) {
          swalWithBootstrapButtons.fire({
            title: "Volviendo al inicio",
            icon: "warning",
            allowOutsideClick: false,
            willClose: () => {
              window.location.href = "/";
            },
          });
        }
      });
  };

  const process = (data) => {
    const r = _maximize ? -1 : 1;
    const totalConstraints = getTotalConstraints(data);

    let totalColumns = _totalVariables + _excessV + _slackV + _artificialV + 3;
    const totalRows = totalConstraints + 3;

    matrix = generateIntialTable(
      totalConstraints,
      _totalVariables,
      totalRows,
      totalColumns,
      _excessV,
      _slackV,
      _constraints,
      r
    );

    matrix = calculateRowZ(matrix, totalColumns, totalRows);
    imprimirTablaConsola(matrix, "Tabla inicial fase 1");

    addMatrizJson("Tabla inicial", matrix);

    let isValidPhase1 = verifyPhase1(matrix, totalColumns, totalRows);
    let it = 1;

    while (isValidPhase1) {
      matrix = solvePhase1(matrix, totalColumns, totalRows);
      imprimirTablaConsola(matrix, "Fase 1 - Iteración " + it);
      addMatrizJson("Fase 1 - Iteración " + it, matrix);
      isValidPhase1 = verifyPhase1(matrix, totalColumns, totalRows);
      it++;
      if (it == 15) {
        alert();
        return;
      }
    }

    it = 1;
    totalColumns = totalColumns - _artificialV;
    matrix = generateTableForPhase2(
      matrix,
      totalColumns,
      totalRows,
      _objectiveFunction
    );

    imprimirTablaConsola(matrix, "FASE 2 - TABLA " + it);
    addMatrizJson("Tabla inicial fase 2", matrix);
    let isValidPhase2 = verifyPhase2(matrix, totalColumns, totalRows);

    while (isValidPhase2) {
      matrix = solvePhase1(matrix, totalColumns, totalRows);
      imprimirTablaConsola(matrix, "FASE 2 - TABLA " + it);
      addMatrizJson("Fase 1 - Iteración" + it, matrix);
      isValidPhase2 = verifyPhase2(matrix, totalColumns, totalRows);
      it++;
      if (it == 15) {
        alert();
        return;
      }
    }

    console.log("SE ACABO EL PROCESO");
    const res = generateResult(matrix, totalColumns, totalRows);

    console.log("Resultado: ");
    console.log(res);
    console.log(matricesJSON);

    drawTable(matricesJSON);

    viewedResults(matrix, totalColumns, totalRows);
    window.scrollTo(0, 0);
  };

  const generateResult = (matrix, totalCol, totalRow) => {
    let varArr = Array(2).fill(0);
    let cont = 0;

    const totalContraints = _constraints.length;

    for (let i = 1; i <= _totalVariables; i++) {
      for (let j = 2; j <= totalContraints + 1; j++) {
        if (matrix[0][i] === matrix[j][0]) {
          varArr[cont] = matrix[j][totalCol - 2];
        }
      }
      cont++;
    }

    let texto = "";
    for (let i = 0; i < _totalVariables; i++) {
      let valX = 0;
      if (varArr[i] !== undefined) {
        valX = varArr[i];
      }
      texto += "X" + (i + 1) + " = " + valX + "\n";
      valX = 0;
    }

    let r = matrix[totalRow - 1][totalCol - 2];
    texto += "Z = " + r;

    return texto;
  };

  const viewedResults = (matrix, totalCol, totalRow) => {
    let varArr = Array(2).fill(0);
    let cont = 0;

    const totalContraints = _constraints.length;

    for (let i = 1; i <= _totalVariables; i++) {
      for (let j = 2; j <= totalContraints + 1; j++) {
        if (matrix[0][i] === matrix[j][0]) {
          varArr[cont] = matrix[j][totalCol - 2];
        }
      }
      cont++;
    }

    let resultContainer = document.querySelector(".result-container");
    let resultTableBody = resultContainer.querySelector("tbody");
    let valorZ = matrix[totalRow - 1][totalCol - 2];

    resultTableBody.innerHTML = ""; // Limpiamos el contenido existente

    for (let i = 0; i < _totalVariables; i++) {
      let valX = varArr[i] !== undefined ? varArr[i] : 0;
      resultTableBody.innerHTML += `<tr><td>X${
        i + 1
      }</td><td>${valX}</td></tr>`;
    }

    document.getElementById("valor-z").textContent = valorZ;
  };

  const verifyPhase1 = (matriz, cantC, cantF) => {
    return matriz[cantF - 1][cantC - 2] !== 0;
  };

  const imprimirTablaConsola = (matriz, message) => {
    console.log(message);

    for (let i = 0; i < matriz.length; i++) {
      let fila = "";
      for (let j = 0; j < matriz[i].length; j++) {
        fila += matriz[i][j] + "\t"; // Agrega un tabulador entre cada elemento para formatear la salida
      }
      console.log(fila); // Imprime la fila en la consola
    }
  };

  const solvePhase1 = (matrix, totalCol, totalRow) => {
    matrix = convertToFractionMathjs(matrix);
    const { colP, rowP } = pivot(matrix, totalCol, totalRow);

    const aux = math.fraction(matrix[rowP][colP]);
    for (let i = 1; i < totalCol - 1; i++) {
      matrix[rowP][i] = math.divide(matrix[rowP][i], aux);
    }

    matrix[rowP][0] = matrix[0][colP];
    matrix[rowP][totalCol - 1] = matrix[1][colP];

    for (let i = 2; i < totalRow - 1; i++) {
      if (i !== rowP && matrix[i][colP].s !== 0) {
        let p = matrix[i][colP];

        if (math.abs(matrix[i][colP]) === 1) {
          if (matrix[i][colP].s > 0) {
            for (let j = 1; j < totalCol - 1; j++) {
              matrix[i][j] = math.add(
                math.multiply(-1, matrix[rowP][j]),
                matrix[i][j]
              );
            }
          } else {
            for (let j = 1; j < totalCol - 1; j++) {
              matrix[i][j] = math.add(matrix[i][j], matrix[rowP][j]);
            }
          }
        } else {
          if (matrix[i][colP].s > 0) {
            for (let j = 1; j < totalCol - 1; j++) {
              matrix[i][j] = math.add(
                math.multiply(-1, math.multiply(p, matrix[rowP][j])),
                matrix[i][j]
              );
            }
          } else {
            for (let j = 1; j < totalCol - 1; j++) {
              matrix[i][j] = math.add(
                math.multiply(-1, math.multiply(p, matrix[rowP][j])),
                matrix[i][j]
              );
            }
          }
        }
      }
    }

    matrix = convertFractionsString(matrix);
    matrix = calculateRowZ(matrix, totalCol, totalRow);
    return matrix;
  };

  const generateTableForPhase2 = (matrix, totalCol, totalRow, fObjetivo) => {
    let matrizForPhase2 = [];

    matrizForPhase2 = createMatrix(totalRow, totalCol);

    let col = 1 + _totalVariables + _slackV + _excessV;
    for (let i = 0; i < totalRow; i++) {
      for (let j = 0; j < col; j++) {
        matrizForPhase2[i][j] = matrix[i][j];
      }
    }

    for (let i = 0; i < totalRow; i++) {
      for (let j = col; j < totalCol; j++) {
        matrizForPhase2[i][j] = matrix[i][j + _artificialV];
      }
    }

    for (let i = 0; i < _totalVariables; i++) {
      let value = fObjetivo[i].toString();
      if (value.includes("/")) {
        let parts = value.split("/");
        matrizForPhase2[0][i + 1] = math.fraction(parts[0], parts[1]);
      } else {
        matrizForPhase2[0][i + 1] = math.fraction(value);
      }
    }

    for (let i = 2; i < totalRow - 1; i++) {
      for (let j = 1; j <= _totalVariables; j++) {
        if (matrizForPhase2[i][totalCol - 1] == matrizForPhase2[1][j]) {
          matrizForPhase2[i][0] = matrizForPhase2[0][j];
        }
      }
    }

    matrizForPhase2 = calculateRowZ(matrizForPhase2, totalCol, totalRow);
    return matrizForPhase2;
  };

  const pivot = (matrix, totalCol, totalRow) => {
    let aux = 0;
    let colP = 0;
    let rowP = 0;

    aux = math.fraction(matrix[totalRow - 1][1]);

    if (_maximize === true) {
      for (let i = 1; i < totalCol - 2; i++) {
        if (math.smallerEq(matrix[totalRow - 1][i], aux)) {
          aux = matrix[totalRow - 1][i];
          colP = i;
        }
      }
    } else {
      for (let i = 1; i < totalCol - 2; i++) {
        if (math.largerEq(matrix[totalRow - 1][i], aux)) {
          aux = matrix[totalRow - 1][i];
          colP = i;
        }
      }
    }

    aux = math.fraction(100000000000);
    for (let i = 2; i < totalRow - 1; i++) {
      if (!math.equal(matrix[i][colP], 0)) {
        let r = math.divide(matrix[i][totalCol - 2], matrix[i][colP]);
        if (math.smallerEq(r, aux) && math.larger(r, 0)) {
          aux = r;
          rowP = i;
        }
      }
    }

    return { rowP, colP };
  };

  const getTotalConstraints = (data) => {
    return data.length - 1;
  };

  const extractConstraints = (data) => {
    let constraints = [];
    for (let i = 1; i < data.length; i++) {
      constraints.push(data[i][data[i].length - 1]);
    }
    return constraints;
  };

  const extractObjectiveFunction = (data) => {
    return data[0].slice(0, -1);
  };

  const extractConstraintResults = (data) => {
    let outputValues = [];
    for (let i = 1; i < data.length; i++) {

      let value = data[i][data[i].length - 2];
      let res = 0;
      if (value.includes("/")){
        let fr = value.split("/");
        res = parseFloat(fr[0]) / parseFloat(fr[1]);
      }else{
        res = parseFloat(value);
      }
      outputValues.push(res.toString());
    }
    return outputValues;
  };

  const isMaximize = (data) => {
    return data[0][data.length - 1] === "max";
  };

  const getTotalVariables = (data) => {
    let variables = 0;
    for (let i = 1; i < data.length; i++) {
      let arreglo = data[i];
      variables = arreglo.length - 2;
    }
    return variables;
  };

  const extractConstraintVariables = (data) => {
    let variables = [];

    for (let i = 1; i < data.length; i++) {
      let row = data[i];
      let processedRow = row.slice(0, row.length - 2);
      variables.push(processedRow);
    }

    return variables;
  };

  const countVariables = (data, constraints) => {
    let slackV = 0;
    let excessV = 0;
    let artificialV = 0;

    for (let i = 0; i < data.length; i++) {
      let constraint = constraints[i];
      if (constraint === "<=") {
        slackV++;
      } else if (constraint === ">=") {
        excessV++;
        artificialV++;
      } else if (constraint === "=") {
        artificialV++;
      }
    }

    return {
      slackV,
      excessV,
      artificialV,
    };
  };

  const createMatrix = (totalRows, totalColumns) => {
    let matrix = [];

    for (let i = 0; i < totalRows; i++) {
      matrix.push(new Array(totalColumns).fill("0"));
    }

    return matrix;
  };

  const generateIntialTable = (
    totalConstraints,
    totalVariables,
    totalRows,
    totalColumns,
    excessV,
    slackV,
    constraints,
    r
  ) => {
    let matrix = createMatrix(totalRows, totalColumns);
    let contS = 1;
    let contR = 1;
    let contH = 1;
    let contF = 2;

    for (let i = 0; i < totalConstraints; i++) {
      for (let j = 0; j < totalVariables; j++) {
        let inputValue = _constraintVariables[i][j];
        if (inputValue.includes("/")) {
          let fraction = math.fraction(inputValue);
          matrix[contF][j + 1] = fraction;
        } else {
          matrix[contF][j + 1] = math.fraction(inputValue);
        }
      }

      for (let a = 0; a < totalVariables; a++) {
        let v = "X" + (a + 1);
        matrix[1][a + 1] = v;
      }

      matrix[1][totalColumns - 2] = "bi";
      matrix[1][totalColumns - 1] = "xb";

      if (constraints[i] === "<=") {
        matrix[contF][totalVariables + excessV + contH] = math.fraction(1);
        let v = "H" + contH;
        matrix[1][totalVariables + excessV + contH] = v;
        matrix[contF][totalColumns - 1] = v;
        matrix[contF][0] = math.fraction(0);
        contH++;
      }

      if (constraints[i] === "=") {
        let colu = totalVariables + excessV + slackV + contR;
        matrix[contF][colu] = math.fraction(1);
        let v = "R" + contR;
        matrix[1][colu] = v;
        matrix[contF][totalColumns - 1] = v;
        matrix[0][colu] = math.fraction(1);
        matrix[contF][0] = math.fraction(1);
        contR++;
      }

      if (constraints[i] === ">=") {
        let colu = totalVariables + excessV + slackV + contR;
        matrix[contF][colu] = math.fraction(1);
        let v = "R" + contR;
        matrix[1][colu] = v;
        matrix[contF][totalColumns - 1] = v;
        matrix[0][colu] = math.fraction(1);
        matrix[contF][0] = math.fraction(1);
        contR++;
        v = "S" + contS;
        matrix[contF][totalVariables + contS] = math.fraction(-1);
        matrix[1][totalVariables + contS] = v;
        contS++;
      }

      if (_constraintResults[i].includes("/")) {
        let fraction = math.fraction(_constraintResults[i]);
        matrix[contF][totalColumns - 2] = fraction;
      } else {
        matrix[contF][totalColumns - 2] = math.fraction(_constraintResults[i]);
      }

      contF++;
    }

    matrix[0][0] = "Cx-Cj";
    matrix[1][0] = " ";
    matrix[totalRows - 1][0] = "Zj-Cj";

    matrix = convertFractionsString(matrix);
    return matrix;
  };

  const convertFractionsString = (matrix) => {
    return matrix.map((row) =>
      row.map((element) => {
        if (typeof element === "object") {
          if (element.d === 1) {
            return element.s * element.n;
          }
          let sign = element.s < 0 ? "-" : ""; // Manejo del signo
          return sign + Math.abs(element.s * element.n) + "/" + element.d;
        } else {
          return element.toString();
        }
      })
    );
  };

  function convertToFractionMathjs(matrix) {
    return matrix.map((row) =>
      row.map((element) => {
        if (typeof element === "number") {
          return math.fraction(element);
        } else if (typeof element === "string") {
          if (element.includes("/")) {
            let parts = element.split("/");
            if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
              return math.fraction(parseInt(parts[0]), parseInt(parts[1]));
            }
          }
          // Si no es una fracción, se deja como está
          return element;
        } else {
          // Si no es un número ni una cadena, se deja como está
          return element;
        }
      })
    );
  }

  const calculateRowZ = (matrix, totalCol, totalRow) => {
    matrix = convertToFractionMathjs(matrix);

    for (let i = 1; i < totalCol; i++) {
      matrix[totalRow - 1][i] = 0;
    }

    for (let i = 1; i < totalCol - 2; i++) {
      for (let j = 2; j < totalRow - 1; j++) {
        matrix[totalRow - 1][i] = math.add(
          matrix[totalRow - 1][i],
          math.multiply(matrix[j][i], matrix[j][0])
        );
      }

      matrix[totalRow - 1][i] = math.subtract(
        matrix[totalRow - 1][i],
        matrix[0][i]
      );
    }

    // Z
    for (let i = 2; i < totalRow - 1; i++) {
      matrix[totalRow - 1][totalCol - 2] = math.add(
        matrix[totalRow - 1][totalCol - 2],
        math.multiply(matrix[i][0], matrix[i][totalCol - 2])
      );
    }

    matrix = convertFractionsString(matrix);
    return matrix;
  };

  const verifyPhase2 = (matrix, totalCol, totalRow) => {
    for (let i = 0; i < totalCol - 2; i++) {
      const value = matrix[totalRow - 1][i];
      if (_maximize) {
        if (value < 0) {
          return true;
        }
      } else {
        if (value > 0) {
          return true;
        }
      }
    }
    return false;
  };

  const addMatrizJson = (titulo, matriz) => {
    matricesJSON.matrices.push({
      titulo: titulo,
      matriz: matriz,
    });
  };

  const drawTable = (data) => {
    let html = "";
    data.matrices.forEach((tabla) => {
      html += `<div class="container mt-4">
                    <h3  id="miRoj" class="miRojo">${tabla.titulo}</h3>
                    <table class="table table-bordered text-center">
                        <thead>
                            <tr>`;
      tabla.matriz[0].forEach((columna) => {
        html += `<th>${columna}</th>`;
      });
      html += `           </tr>
                        </thead>
                        <tbody>`;
      for (let i = 1; i < tabla.matriz.length; i++) {
        html += "<tr>";
        tabla.matriz[i].forEach((valor) => {
          html += `<td>${valor}</td>`;
        });
        html += "</tr>";
      }
      html += `           </tbody>
                    </table>
                </div>`;
    });
    document.getElementById("table-container").innerHTML = html;
  };

  const crearBoton = () => {
    let botonInicio = document.createElement('button');
    botonInicio.textContent = 'Volver al inicio';
    botonInicio.id = 'botonInicio';
    botonInicio.classList.add('btn', 'btn-lg', 'mi-boton'); // Separando las clases por comas
    divContenedorBotones.appendChild(botonInicio);
    eventoBoton(botonInicio);
}

const eventoBoton = (boton) =>{
    boton.addEventListener('click', function (){
      window.location.href = "/";
    })
}


  /*const matrixinicialprueba = [
    ["215", "230", "210", "min"],
    ["1/2", "3/2", "1/2", "3/2", ">="],
    ["1", "0", "2", "1", ">="],
    ["1/2", "1/2", "0", "5/2", ">="],
  ];

  mostrarProblema(matrixinicialprueba);
  initializeVariables(matrixinicialprueba);
  process(matrixinicialprueba);*/

  mostrarProblema(datos);


  initializeVariables(datos);
  process(datos);
  crearBoton();
});
