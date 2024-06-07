(function ($) {
  "use strict";
  kintone.events.on(
    ["app.record.create.submit", "app.record.edit.submit"],
    function (event) {
      const record = event.record;
      console.log(record);

      const errorField = [];
      if (!record["venue_scale"].value) {
        record["venue_scale"].error = "この項目は入力が必須です。";
        errorField.push("会場規模");
      }
      if (!record["chief_mourner"].value) {
        record["chief_mourner"].error = "この項目は入力が必須です。";
        errorField.push("喪主");
      }
      if (!record["bereaved_family"].value) {
        record["bereaved_family"].error = "この項目は入力が必須です。";
        errorField.push("ご葬家");
      }
      if (!record["sender_name"].value) {
        record["sender_name"].error = "この項目は入力が必須です。";
        errorField.push("贈り主の名前");
      }
      if (!record["content"].value) {
        record["content"].error = "この項目は入力が必須です。";
        errorField.push("内容");
      }
      if (errorField.length > 0) {
        const modal = document.getElementById("errorModal");
        const errorMessage = document.getElementById("errorMessage");
        errorMessage.innerHTML = errorField
          .map((field) => `<li>${field}</li>`)
          .join("");
        modal.style.display = "block";
        return event;
      }
    }
  );

  kintone.events.on("app.record.create.show", async (event) => {
    console.log(listProducts);
    const $modalHTML = `
      <div id="errorModal" class="kintone-custom-modal">
        <div class="kintone-custom-modal-content">
          <span class="kintone-custom-close">&times;</span>
          <p>以下の項目は必須です:</p>
          <ul id="errorMessage"></ul>
        </div>
      </div>`;
    const $modalStyle = `
      <style>
        .kintone-custom-modal {
          display: none; /* Hidden by default */
          position: fixed;
          z-index: 1000;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          overflow: auto;
          background-color: rgba(0,0,0,0.4);
        }
        .kintone-custom-modal-content {
          background-color: #e74c3c;
          color: white;
          margin: 15% auto;
          padding: 20px;
          border: 1px solid #888;
          width: 80%;
          max-width: 500px;
          border-radius: 8px;
        }
        .kintone-custom-close {
          color: #aaa;
          float: right;
          font-size: 28px;
          font-weight: bold;
        }
        .kintone-custom-close:hover,
        .kintone-custom-close:focus {
          color: black;
          text-decoration: none;
          cursor: pointer;
        }
      </style>
    `;
    $("body").append($modalHTML);
    $("body").append($modalStyle);
    const modal = document.getElementById("errorModal");
    const span = document.getElementsByClassName("kintone-custom-close")[0];

    span.onclick = function () {
      modal.style.display = "none";
    };

    window.onclick = function (event) {
      if (event.target == modal) {
        modal.style.display = "none";
      }
    };

    return event;
  });
})(jQuery);
