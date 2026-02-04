const statusEl = document.getElementById("status");
const rekapEl = document.getElementById("rekap");

const FORM_URL =
"https://docs.google.com/forms/d/e/1FAIpQLSfhbHy8EX_RoYo3NGugSuKmEOb06prrdMvULrfpO1XEfGKD6w/formResponse";

let database = [];
let scannedToday = new Set();
let isSubmitting = false;

// LOAD DATABASE
fetch("karyawan.json")
.then(res => res.json())
.then(data => database = data);

// VALIDASI
function validasi(id,nama,jabatan){
  return database.some(k =>
    k.id === id &&
    k.nama === nama &&
    k.jabatan === jabatan
  );
}

// KIRIM KE GOOGLE FORM
function kirimForm(data){

  const formData = new FormData();

  formData.append("entry.2129652086", data.id);
  formData.append("entry.1423031901", data.nama);
  formData.append("entry.476602258", data.jabatan);

  fetch(FORM_URL,{
    method:"POST",
    mode:"no-cors",
    body:formData
  });

  const now = new Date();

  rekapEl.innerText = `
Nama: ${data.nama}
Jabatan: ${data.jabatan}
Tanggal: ${now.toLocaleDateString("id-ID")}
Jam: ${now.toLocaleTimeString("id-ID")}
`;

  statusEl.innerText = "Presensi berhasil ✔";
  statusEl.className = "success";

  setTimeout(()=>{
    statusEl.innerText = "Menunggu scan...";
  },3000);
}

// SCAN SUCCESS
function onScanSuccess(text){

  if(isSubmitting) return;
  isSubmitting = true;

  const parts = text.split("|");

  if(parts.length !== 3){
    statusEl.innerText = "QR tidak valid ❌";
    statusEl.className = "error";
    isSubmitting = false;
    return;
  }

  let data = {
    id: parts[0],
    nama: parts[1],
    jabatan: parts[2]
  };

  if(!validasi(data.id,data.nama,data.jabatan)){
    statusEl.innerText = "Tidak terdaftar ❌";
    statusEl.className = "error";
    isSubmitting = false;
    return;
  }

  const key =
    data.id +
    new Date().toLocaleDateString("id-ID");

  if(scannedToday.has(key)){
    statusEl.innerText = "Sudah scan hari ini ❌";
    statusEl.className = "warning";
    isSubmitting = false;
    return;
  }

  scannedToday.add(key);

  kirimForm(data);
  isSubmitting = false;
}

// START CAMERA
Html5Qrcode.getCameras().then(cameras=>{
  const cam = cameras[0].id;

  const scanner = new Html5Qrcode("reader");

  scanner.start(
    cam,
    { fps:10, qrbox:250 },
    onScanSuccess
  );
});
