document.getElementById('googleForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const form = e.target;
    const data = new FormData(form);

    data.append('fvv', '1');
    data.append('draftResponse', '[]');
    data.append('pageHistory', '0');

    const url = 'https://docs.google.com/forms/d/e/1FAIpQLScP312CmMXirBzjDLYoZLk330cvIHoUgnSV-xZS1I-mgYM8YA/formResponse';

    fetch(url, {
        method: 'POST',
        mode: 'no-cors',
        body: data
    })
    .then(() => {

        const total = updateOrderSummary();

        if (total === 0) {
            alert("Veuillez sélectionner au moins un menu.");
            return;
        }

        alert(
            "Commande enregistrée ! Total : " + total.toFixed(2) + " €\n" +
            "Vous allez maintenant être redirigé vers le paiement ....\n" +
            "Note : conservez le lien de paiement pour payer ultérieurement."
        );

        window.open("https://paypal.me/mamanutri/" + total.toFixed(2), "_blank");

        // ✅ Reset complet du formulaire
        form.reset();

        // ✅ Désélectionner tous les menus + remettre quantité à 1
        document.querySelectorAll(".menu-card").forEach(card => {
            card.classList.remove("selected");
            card.querySelector(".quantity-selector input").value = 1;
        });

        // ✅ Mettre à jour le panier
        updateOrderSummary();

    })
    .catch(() => {
        alert("Erreur lors de l’envoi.");
    });
});

// ============================
// PANIER + TOTAL + PAYPAL
// ============================
function updateOrderSummary() {
    const summary = document.getElementById("orderSummary");
    const totalSpan = document.getElementById("orderTotal");
    const hiddenField = document.getElementById("hiddenOrder");

    let total = 0;
    let textToSend = "";

    summary.innerHTML = "";

    document.querySelectorAll(".menu-card.selected").forEach(card => {
        const name = card.dataset.name;
        const price = parseFloat(card.dataset.price);
        const qty = parseInt(card.querySelector(".quantity-selector input").value);

        const lineTotal = price * qty;
        total += lineTotal;

        summary.innerHTML += `
            <div class="order-item">
                <span>${name} (x${qty})</span>
                <span>${lineTotal.toFixed(2)} €</span>
            </div>
        `;

        textToSend += `${name} x${qty} = ${lineTotal.toFixed(2)} €\n`;
    });

    if (total === 0) {
        summary.innerHTML = "<p>Aucun menu sélectionné.</p>";
    }

    totalSpan.textContent = total.toFixed(2) + " €";

    // Champ caché envoyé à Google Forms
    hiddenField.value = textToSend + "\nTOTAL = " + total.toFixed(2) + " €";

    return total;
}

// ============================
// MENU SELECTION + QUANTITE
// ============================
document.querySelectorAll(".menu-card").forEach(card => {

    // Toggle sélection menu
    card.addEventListener("click", function(e) {
        if (e.target.closest(".quantity-selector")) return;

        card.classList.toggle("selected");
        updateOrderSummary();
    });

    const plus = card.querySelector(".plus");
    const minus = card.querySelector(".minus");
    const input = card.querySelector(".quantity-selector input");

    // Augmenter quantité
    plus.addEventListener("click", function(e) {
        e.stopPropagation();
        input.value = parseInt(input.value) + 1;
        updateOrderSummary();
    });

    // Diminuer quantité
    minus.addEventListener("click", function(e) {
        e.stopPropagation();
        let current = parseInt(input.value);
        if (current > 1) input.value = current - 1;
        updateOrderSummary();
    });

});
