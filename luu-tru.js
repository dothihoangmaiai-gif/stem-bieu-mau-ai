/* Lưu dữ liệu biểu mẫu vào Google Trang tính của nhóm (qua Google Apps Script).
   Giáo viên dán địa chỉ Web app vào WEB_APP_URL. Để trống thì trang vẫn chạy như cũ (chỉ gửi tới ketqua.html). */
var WEB_APP_URL = "https://script.google.com/macros/s/AKfycbz3lDVehB_bX0igJGKis58c4k7E_yIyxB8xgI4aTj6BrbDxTdpDPgUkiuxxgaD7UTg9/exec";
var SHEET_URL = {
  "1": "https://docs.google.com/spreadsheets/d/1p_MYcADwGQbUenzPWnX8JtearKrQLYotlkmAQ36Ovyg/edit",
  "2": "https://docs.google.com/spreadsheets/d/1iI-vrht_UCsubcVgUrwf8R2mgyXVRAPFmj5Ouuq46jE/edit",
  "3": "https://docs.google.com/spreadsheets/d/1OC3e3Fq15GleOSKyY5pl66cdus-QLNFbIERflv_d71A/edit",
  "4": "https://docs.google.com/spreadsheets/d/1fo3oNmuEwHKuhwfZhj4iyoJAlZQvfY6Buy5fsW162BQ/edit"
};
(function () {
  var m = location.pathname.match(/nhom(\d)_phien_ban_(\d)/);
  if (!m || !WEB_APP_URL) return;
  function bao(form, html, mau) {
    var b = form.querySelector(".bao-luu") || form.appendChild(Object.assign(document.createElement("div"), { className: "bao-luu" }));
    b.innerHTML = html; b.style.color = mau; b.scrollIntoView({ behavior: "smooth", block: "center" });
  }
  document.querySelectorAll("form").forEach(function (form) {
    form.addEventListener("submit", function (ev) {
      if (form.dataset.daLuu) return;
      ev.preventDefault();
      var dl = new URLSearchParams();
      new FormData(form).forEach(function (v, k) { if (typeof v === "string") dl.append(k, v); });
      dl.append("nhom", m[1]); dl.append("phien_ban", m[2]);
      dl.append("Giờ gửi (VN)", new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" }));
      bao(form, "⏳ Đang lưu vào Google Trang tính của nhóm…", "#555");
      form.addEventListener("input", function () { delete form.dataset.daLuu; }, { once: true });
      var daXong = false;
      var xong = function (ok) {
        if (daXong) return; daXong = true;
        form.dataset.daLuu = "1";
        bao(form, (ok ? "✅ <b>Đã lưu phiếu vào Google Trang tính của nhóm</b> (trang tính “Phiên bản " + m[2] + "”, dòng cuối cùng)."
                      : "⚠ <b>Chưa lưu được</b> (kiểm tra mạng rồi bấm Gửi phiếu lại).") +
          '<br><a class="nut-xem" href="' + SHEET_URL[m[1]] + '" target="_blank" rel="noopener">📄 Mở Google Trang tính xem phiếu đã lưu</a>' +
          '<a class="nut-xem nut-phu" href="#" id="xem-kq">Xem dữ liệu vừa gửi →</a>', ok ? "#166534" : "#b45309");
        if (!ok) delete form.dataset.daLuu;
        form.querySelector("#xem-kq").addEventListener("click", function (e) { e.preventDefault(); form.dataset.daLuu = "1"; HTMLFormElement.prototype.submit.call(form); });
      };
      var hen = setTimeout(function () { xong(false); }, 8000);
      fetch(WEB_APP_URL, { method: "POST", mode: "no-cors", body: dl })
        .then(function () { clearTimeout(hen); xong(true); })
        .catch(function () { clearTimeout(hen); xong(false); });
    });
  });
})();
