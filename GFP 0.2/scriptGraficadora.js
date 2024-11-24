document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("gestionForm");
    const ingresoInput = document.getElementById("ingreso");
    const frecuenciaInput = document.getElementById("frecuencia");

    const gastoComidaRadio = document.getElementsByName("gastoComida");
    const comidaDetails = document.getElementById("comidaDetails");
    const gastoComidaInput = document.getElementById("gastoComida");

    const gastoTransporteRadio = document.getElementsByName("gastoTransporte");
    const transporteDetails = document.getElementById("transporteDetails");
    const transporteTipo = document.getElementById("transporteTipo");
    const numeroViajesInput = document.getElementById("numeroViajes");

    const gastoGasolinaRadio = document.getElementsByName("gastoGasolina");
    const gasolinaDetails = document.getElementById("gasolinaDetails");
    const gastoGasolinaInput = document.getElementById("gastoGasolina");

    const categorias = [
        { name: "gastoColegiaturas", inputId: "gastoColegiaturas", detailsId: "colegiaturasDetails" },
        { name: "gastoRenta", inputId: "gastoRenta", detailsId: "rentaDetails" },
        { name: "gastoCelular", inputId: "gastoCelular", detailsId: "celularDetails" },
        { name: "gastoEntretenimiento", inputId: "gastoEntretenimiento", detailsId: "entretenimientoDetails" },
        { name: "gastoTarjetas", inputId: "gastoTarjetas", detailsId: "tarjetasDetails" },
        { name: "gastoOtrosCreditos", inputId: "gastoOtrosCreditos", detailsId: "otrosCreditosDetails" },
    ];

    let myChart;

    // Cargar los datos desde localStorage si existen
    const gastos = JSON.parse(localStorage.getItem("gastos"));
    const ingresosMensuales = parseFloat(localStorage.getItem("ingresosMensuales"));
    const dineroDisponible = parseFloat(localStorage.getItem("dineroDisponible"));

    if (gastos && ingresosMensuales && dineroDisponible) {
        renderChart(gastos, ingresosMensuales, dineroDisponible);
    }

    function toggleDetails(radioButtons, detailsElement) {
        Array.from(radioButtons).forEach((radio) => {
            radio.addEventListener("change", function () {
                detailsElement.style.display = this.value === "si" ? "block" : "none";
            });
        });
    }
    toggleDetails(gastoComidaRadio, comidaDetails);
    toggleDetails(gastoTransporteRadio, transporteDetails);
    toggleDetails(gastoGasolinaRadio, gasolinaDetails);

    categorias.forEach((categoria) => {
        const radioButtons = document.getElementsByName(categoria.name);
        const detailsElement = document.getElementById(categoria.detailsId);
        toggleDetails(radioButtons, detailsElement);
    });

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const ingreso = parseFloat(ingresoInput.value);
        const frecuencia = frecuenciaInput.value;
        let ingresosMensuales = 0;

        if (frecuencia === "mensual") {
            ingresosMensuales = ingreso;
        } else if (frecuencia === "quincenal") {
            ingresosMensuales = ingreso * 2;
        } else if (frecuencia === "semanal") {
            ingresosMensuales = ingreso * 4;
        }

        const gastos = {};

        const comidaSeleccionada = Array.from(gastoComidaRadio).find((r) => r.checked)?.value;
        if (comidaSeleccionada === "si") {
            gastos.comida = parseFloat(gastoComidaInput.value) || 0;
        } else {
            gastos.comida = 0;
        }

        const transporteSeleccionado = Array.from(gastoTransporteRadio).find((r) => r.checked)?.value;
        if (transporteSeleccionado === "si") {
            const tipo = transporteTipo.value;
            const numeroViajes = parseInt(numeroViajesInput.value) || 0;
            if (tipo === "metro") {
                gastos.transporte = numeroViajes * 8.2;
            } else if (tipo === "camion") {
                gastos.transporte = numeroViajes * 13;
            }
        } else {
            gastos.transporte = 0;
        }

        const gasolinaSeleccionada = Array.from(gastoGasolinaRadio).find((r) => r.checked)?.value;
        if (gasolinaSeleccionada === "si") {
            gastos.gasolina = parseFloat(gastoGasolinaInput.value) || 0;
        } else {
            gastos.gasolina = 0;
        }

        categorias.forEach((categoria) => {
            const seleccionada = Array.from(document.getElementsByName(categoria.name)).find((r) => r.checked)?.value;
            if (seleccionada === "si") {
                const monto = parseFloat(document.getElementById(categoria.inputId).value) || 0;
                gastos[categoria.name] = monto;
            } else {
                gastos[categoria.name] = 0;
            }
        });

        const totalGastos = Object.values(gastos).reduce((acc, val) => acc + val, 0);
        const dineroDisponible = ingresosMensuales - totalGastos;

        // Guardar en localStorage
        localStorage.setItem("gastos", JSON.stringify(gastos));
        localStorage.setItem("ingresosMensuales", ingresosMensuales);
        localStorage.setItem("dineroDisponible", dineroDisponible);

        renderChart(gastos, ingresosMensuales, dineroDisponible);

        // Volver al inicio de la página después de enviar el formulario
        window.scrollTo(0, 0);
    });

    function renderChart(gastos, ingresosMensuales, dineroDisponible) {
        const ctx = document.getElementById("myChart").getContext("2d");
        if (myChart) {
            myChart.destroy();
        }

        myChart = new Chart(ctx, {
            type: "polarArea",
            data: {
                labels: ["Comida", "Transporte", "Gasolina", "Colegiaturas", "Renta", "Celular", "Entretenimiento", "Tarjetas", "Otros Créditos", "Disponible"],
                datasets: [
                    {
                        label: "Total",
                        data: [
                            gastos.comida,
                            gastos.transporte,
                            gastos.gasolina,
                            gastos.gastoColegiaturas,
                            gastos.gastoRenta,
                            gastos.gastoCelular,
                            gastos.gastoEntretenimiento,
                            gastos.gastoTarjetas,
                            gastos.gastoOtrosCreditos,
                            dineroDisponible,
                        ],
                        backgroundColor: [
                            "#E4A1B5",//Comida
                            "#73C2E1",//Transporte
                            "#F4D35E",//Gasolina
                            "#92C77D",//Colegiaturas
                            "#D26466",//Renta
                            "#F2E8CF",//Celular
                            "#A17EBF",//Entretenimiento
                            "#407899",//Tarjetas
                            "#DB9D47", //Otros Créditos
                            "#5F3C51",//Disponible
                        ],
                    },
                ],
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false,
                    },
                },
                scales: {
                    y: {
                        beginAtZero: true,
                    },
                },
            },
        });
    }

    document.getElementById("clearLocalStorage").addEventListener("click", function () {
        localStorage.clear();
        alert("Memoria limpiada");
    });
});
