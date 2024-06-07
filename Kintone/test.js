(function ($) {
    "use strict";
  
    const TAX = 10;
    const PRODUCT_APP_ID = 6;
    const ORDER_ITEM_APP_ID = 11;
  
    const selectedProducts = [];
  
    kintone.events.on(
      ["app.record.create.submit", "app.record.edit.submit"],
      function (event) {
        kintone.api(
          kintone.api.url("/k/v1/app/form/fields.json", true),
          "GET",
          body,
          function (resp) {
            // success
            console.log(resp);
          },
          function (error) {
            // error
            console.log(error);
          }
        );
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
        if (!record["scheduled_agenda_0"].value) {
          record["scheduled_agenda_0"].error = "この項目は入力が必須です。";
          errorField.push("式日程");
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
          // return event;
        }
      }
    );
  
    kintone.events.on("app.record.create.show", async (event) => {
      const $modalHTML = `
        <div id="errorModal" class="kintone-custom-modal">
          <div class="kintone-custom-modal-content">
            <span class="kintone-custom-close">&times;</span>
            <p>エラーが発生しました。<br> 以下の入力データにエラーがあるため、レコードを保存できません。</p>
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
            margin: 10% auto;
            padding: 20px;
            border: 1px solid #888;
            width: 90%;
            max-width: 600px;
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
  
      // append button
      const $flowerBtn = $(
        '<button id="flower-btn" class="choose-prod-btn" data-bs-toggle="modal" data-bs-target="#product-modal" data-type="生花" disabled>生花</button>'
      );
      const $basketBtn = $(
        '<button id="basket-btn" class="choose-prod-btn" data-bs-toggle="modal" data-bs-target="#product-modal" data-type="盛籠" disabled>盛籠</button>'
      );
      const $wreathBtn = $(
        '<button id="wreath-btn" class="choose-prod-btn" data-bs-toggle="modal" data-bs-target="#product-modal" data-type="花輪" disabled>花輪</button>'
      );
      const $addProductBtn = $(
        '<button id="add-product-btn" class="">追加する</button>'
      );
      const $registerBtn = $(
        '<button id="register-btn" class="">情報登録</button>'
      );
  
      $("#user-js-button_fresh_flower").append($flowerBtn);
      $("#user-js-button_basket").append($basketBtn);
      $("#user-js-button_wreath").append($wreathBtn);
      $("#user-js-btn_add").append($addProductBtn);
      $("#user-js-btn_register").append($registerBtn);
  
      // append modal
      const $modal = `
        <div class="modal fade" id="product-modal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-hidden="true">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">供物選択</h5>
                <h5 class="modal-title" id="product-title"></h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body" id="product-content"></div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">キャンセル</button>
                <button type="button" class="btn btn-secondary" id="product-submit" disabled>選択</button>
              </div>
            </div>
          </div>
        </div>`;
      $("body").append($modal);
  
      // fetch products
      const productsFetch = await fetchRecords(PRODUCT_APP_ID);
      const orderItemFetch = await fetchRecords(ORDER_ITEM_APP_ID);
  
      // group product with same name, add product_price save array of id - type - price
      const listProducts = [];
      productsFetch.forEach((product) => {
        const existsIndex = listProducts.findIndex(
          (v) => v.name.value === product.name.value
        );
        const productPrice = {
          id: product.Record_number.value,
          type: product.quantity_type.value,
          price: product.price.value,
        };
        if (existsIndex === -1) {
          product.product_price = [productPrice];
          listProducts.push(product);
        } else {
          listProducts[existsIndex].product_price.push(productPrice);
        }
      });
  
      console.log(event);
      console.log(orderItemFetch);
      console.log(productsFetch);
      console.log(listProducts);
  
      let selectedProductCount = 0;
  
      function toggleBtnProduct(isDisabled) {
        $flowerBtn.prop("disabled", isDisabled);
        $basketBtn.prop("disabled", isDisabled);
        $wreathBtn.prop("disabled", isDisabled);
        $addProductBtn.prop("disabled", !isDisabled);
      }
  
      // add section product when click button add
      $addProductBtn.click(function () {
        selectedProductCount++;
        const $newProduct = `
          <div class="added-product d-flex p-2 ms-5 border" id="added-product-${selectedProductCount}" data-index="${selectedProductCount}">
            <div class="selected-image mx-4"></div>
            <div class="selected-name mx-4"></div>
            <div class="selected-price mx-4">
              <div class="form-group row">
                <label class="col-sm-4 col-form-label">数量</label>
                <div class="col-sm-5">
                  <input type="hidden" class="selected-id">
                  <input type="text" class="form-control selected-quantity" disabled>
                </div>
                <div class="col-sm-3 selected-type"></div>
              </div>
              <br>
              <div class="form-group row">
                <label class="col-sm-4 col-form-label">金額</label>
                <div class="col-sm-5">
                  <input type="text" class="form-control selected-price" disabled>
                </div>
                <div class="col-sm-3">（税込）</div>
              </div>
            </div>
            <div class="mx-4">
              <button type="button" class="btn btn-danger remove-product">x</button>
            </div>
          </div>
        `;
        $("#user-js-order_section").append($newProduct);
        // disable button add, enable button choose
        toggleBtnProduct(false);
      });
  
      // remove current selected product
      $(document).on("click", ".remove-product", function () {
        // update selectedProducts
        const removeIndex = selectedProducts.findIndex(
          (product) =>
            product.selected_index ===
            +$(this).closest(".added-product").data("index")
        );
        console.log(
          "remove",
          removeIndex,
          $(this).closest(".added-product").data("index")
        );
  
        if (removeIndex > -1) {
          selectedProducts.splice(removeIndex, 1);
        }
        console.log("remove", selectedProducts);
        // remove block
        $(this).closest(".added-product").remove();
        // enable button add, disable button choose
        toggleBtnProduct(true);
      });
  
      // $(document).on("click", ".gaia-ui-actionmenu-save", function () {
      //   const record = event.record;
      //   console.log(record);
      //   if (!record["bereaved_family"].value) {
      //     record["bereaved_family"].error = "qq";
      //     isValid = false;
      //   }
      //   if (!isValid) {
      //     return event;
      //   }
      // });
  
      // format only number when change quantity
      $(document).on("input", ".selected-quantity", function () {
        let numericValue = $(this).val().replace(/\D/g, "");
        $(this).val(numericValue);
      });
  
      // update price when change quantity
      $(document).on("change", ".selected-quantity", function () {
        let value = +$(this).val();
        if (!value) {
          value = 1;
          $(this).val(value);
        }
        $(this)
          .closest(".added-product")
          .find(".selected-price")
          .val(($(this).data("price") * value * (100 + TAX)) / 100);
      });
  
      // on close modal
      $(document).on("hidden.bs.modal", "#product-modal", function () {
        $("#product-content").empty();
        $("#product-submit")
          .removeClass("btn-primary")
          .addClass("btn-secondary")
          .prop("disabled", true);
      });
  
      // open modal choose product
      $(document).on("click", ".choose-prod-btn", async function (e) {
        const type = $(this).data("type");
        $("#product-title").text(type);
        $("#product-content").empty();
        const products = listProducts.filter(
          (product) => product.type.value === type
        );
  
        // get list images
        const productImages = [];
        const promises = products.map(async (product) => {
          const file = product.photo.value[0];
          if (!file) {
            return;
          }
          const fileUrl = "/k/v1/file.json?fileKey=" + file.fileKey;
          const imageData = await getFile(fileUrl);
          let url = window.URL || window.webkitURL;
          let imageUrl = url.createObjectURL(imageData);
          productImages.push(imageUrl);
        });
  
        await Promise.all(promises);
  
        // append product
        products.forEach((product, index) => {
          const $product = $(
            `<div class="product-detail" data-id="${product.Record_number.value}" data-type="${product.type.value}" data-image=${productImages[index]} data-checked=false><img src="${productImages[index]}" width=200 style="padding: 5px"></img><div>${product.name.value}</div></div>`
          );
          let $productPrice = $(`<div></div>`);
          // if product has one type: show text, if product has more than 1 type: show radio button to choose type
          if (product.product_price.length > 1) {
            product.product_price.forEach((productPrice) => {
              $productPrice.append(`
                <div class="form-check">
                  <input type="radio" class="form-check-input" id="product-price-${productPrice.id}" value="${productPrice.id}" name="product-${product.name.value}" />
                  <label for="product-price-${productPrice.id}" class="form-check-label">${productPrice.type} ${productPrice.price}</label>
                </div>
              `);
            });
          } else {
            $productPrice.append(
              `1${product.quantity_type.value} ${product.price.value}`
            );
          }
  
          $product.append($productPrice);
  
          $($product).click(function () {
            // highlight selected product
            $(".product-detail")
              .removeClass("border")
              .attr("data-checked", false);
            $(this).addClass("border").attr("data-checked", true);
  
            // toggle button submit, get selected product id
            if (!$(this).find(".form-check-input").length) {
              $("#product-submit")
                .removeClass("btn-secondary")
                .addClass("btn-primary")
                .prop("disabled", false)
                .data("selected-id", +$(this).data("id"))
                .data("image", $(this).data("image"));
            } else {
              const selectedValue = $(
                `input[name="product-${product.name.value}"]:checked`
              ).val();
              if (selectedValue) {
                $("#product-submit")
                  .removeClass("btn-secondary")
                  .addClass("btn-primary")
                  .prop("disabled", false)
                  .data("selected-id", +selectedValue)
                  .data("image", $(this).data("image"));
              } else {
                $("#product-submit")
                  .removeClass("btn-primary")
                  .addClass("btn-secondary")
                  .prop("disabled", true);
              }
            }
          });
  
          $("#product-content").append($product);
        });
      });
  
      // submit add product
      $(document).on("click", "#product-submit", function () {
        const selectedProductId = $(this).data("selected-id");
        const imageSrc = $(this).data("image");
        const selectedProduct = productsFetch.find(
          (product) => +product.Record_number.value === selectedProductId
        );
        if (!selectedProduct) {
          alert("product not found");
          return;
        }
        // add custom field to identify if one product is added many times
        selectedProduct.selected_index = selectedProductCount;
        selectedProducts.push(selectedProduct);
        console.log("add", selectedProducts);
  
        // update content in main screen
        const $productContent = $(`#added-product-${selectedProductCount}`);
        $productContent
          .find(".selected-image")
          .append(`<img src="${imageSrc}" width=200 />`);
        $productContent
          .find(".selected-name")
          .text(`${selectedProduct.name.value}`);
        $productContent
          .find(".selected-type")
          .text(`${selectedProduct.quantity_type.value}`);
  
        const price = +selectedProduct.price.value;
        const priceAfterTax = (price * (100 + TAX)) / 100;
        $productContent
          .find(".selected-quantity")
          .val(1)
          .data("price", price)
          .prop("disabled", false);
        $productContent.find(".selected-price").val(priceAfterTax);
        $productContent.find(".selected-id").val(selectedProductId);
  
        // enable button add, disable button choose
        toggleBtnProduct(true);
  
        $("#product-modal").modal("hide");
      });
  
      return event;
    });
  
    kintone.events.on("app.record.create.submit.success", async function (event) {
      console.log("submit success", event);
      await createOrderItem(event, selectedProducts);
      return event;
    });
  
    async function createOrderItem() {
      console.log(12121);
      await new Promise((resolve) => {
        setTimeout(() => {
          console.log(1345434);
          resolve();
        }, 50000);
      });
    }
  
    async function fetchRecords(appId, opt_offset, opt_limit, opt_records) {
      let offset = opt_offset || 0;
      let limit = opt_limit || 500;
      let allRecords = opt_records || [];
      let params = { app: appId, query: "limit " + limit + " offset " + offset };
      let resp = await kintone.api("/k/v1/records", "GET", params);
      allRecords = allRecords.concat(resp.records);
      if (resp.records.length === limit) {
        return fetchRecords(appId, offset + limit, limit, allRecords);
      }
      return allRecords;
    }
  
    async function getFile(url) {
      let df = new $.Deferred();
      let xhr = new XMLHttpRequest();
  
      xhr.open("GET", url, true);
      xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
      xhr.responseType = "blob";
  
      xhr.onload = function () {
        if (this.status === 200) {
          df.resolve(this.response);
        }
      };
  
      xhr.send();
      return df.promise();
    }
  })(jQuery);
  