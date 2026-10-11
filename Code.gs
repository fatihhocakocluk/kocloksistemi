/**
 * Fatih Hoca Öğrenci Takip — Google Apps Script web app
 * Kalıcı veriler Google Sheets'te tutulur. npm/Node.js gerekmez.
 * İlk kurulum: setup() fonksiyonunu Apps Script editöründen bir kez çalıştırın.
 */
const APP = {
  SHEET_ID_KEY: 'STUDENT_TRACKER_SHEET_ID',
  TEACHER_USER_KEY: 'TEACHER_USERNAME',
  TEACHER_PASS_KEY: 'TEACHER_PASSWORD',
  TEACHER_USER_DEFAULT: 'fatihhoca',
  TEACHER_PASS_DEFAULT: 'fatih45',
  SHEETS: {
    Students: ['id','name','grade','parentEmail','accessCode','createdAt'],
    Entries: ['id','studentId','kind','section','subject','title','detail','score','date','createdAt'],
    Reports: ['studentId','comment','updatedAt']
  }
};

function setup() {
  const props = PropertiesService.getScriptProperties();
  if (!props.getProperty(APP.TEACHER_USER_KEY)) props.setProperty(APP.TEACHER_USER_KEY, APP.TEACHER_USER_DEFAULT);
  if (!props.getProperty(APP.TEACHER_PASS_KEY)) props.setProperty(APP.TEACHER_PASS_KEY, APP.TEACHER_PASS_DEFAULT);
  let id = props.getProperty(APP.SHEET_ID_KEY);
  let ss;
  if (id) {
    try { ss = SpreadsheetApp.openById(id); } catch (e) { ss = null; }
  }
  if (!ss) {
    ss = SpreadsheetApp.create('Fatih Hoca - Öğrenci Takip Veritabanı');
    props.setProperty(APP.SHEET_ID_KEY, ss.getId());
  }
  Object.keys(APP.SHEETS).forEach(name => {
    let sh = ss.getSheetByName(name);
    if (!sh) sh = ss.insertSheet(name);
    if (sh.getLastRow() === 0) {
      sh.appendRow(APP.SHEETS[name]);
      sh.setFrozenRows(1);
      sh.getRange(1,1,1,APP.SHEETS[name].length).setFontWeight('bold').setBackground('#dceee4');
    }
  });
  const defaultSheet = ss.getSheetByName('Sheet1');
  if (defaultSheet && ss.getSheets().length > 1) ss.deleteSheet(defaultSheet);
  return 'Kurulum tamamlandı. Veritabanı: ' + ss.getUrl();
}

function doGet() {
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('Fatih Hoca | Öğrenci Takip')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
function include(filename) { return HtmlService.createHtmlOutputFromFile(filename).getContent(); }

function db_() {
  const id = PropertiesService.getScriptProperties().getProperty(APP.SHEET_ID_KEY);
  if (!id) throw new Error('Veritabanı kurulmamış. Apps Script içinden setup() fonksiyonunu çalıştırın.');
  return SpreadsheetApp.openById(id);
}
function rows_(sheetName) {
  const sh = db_().getSheetByName(sheetName);
  if (!sh || sh.getLastRow() < 2) return [];
  return sh.getRange(2,1,sh.getLastRow()-1,sh.getLastColumn()).getDisplayValues();
}
function teacherOk_(username,password) {
  const p = PropertiesService.getScriptProperties();
  return String(username||'') === (p.getProperty(APP.TEACHER_USER_KEY)||APP.TEACHER_USER_DEFAULT) &&
         String(password||'') === (p.getProperty(APP.TEACHER_PASS_KEY)||APP.TEACHER_PASS_DEFAULT);
}
function requireTeacher_(auth) {
  if (!auth || !teacherOk_(auth.username,auth.password)) throw new Error('Öğretmen girişi gerekli veya oturum bilgileri hatalı.');
}
function id_() { return Utilities.getUuid(); }
function date_() { return Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'Europe/Istanbul', 'yyyy-MM-dd'); }
function clean_(v,max) { return String(v == null ? '' : v).trim().slice(0,max || 4000); }

function teacherLogin(username,password) {
  if (!teacherOk_(username,password)) return {ok:false,message:'Kullanıcı adı veya şifre hatalı.'};
  return {ok:true,username:PropertiesService.getScriptProperties().getProperty(APP.TEACHER_USER_KEY)||APP.TEACHER_USER_DEFAULT};
}
function teacherList(auth) {
  requireTeacher_(auth);
  return rows_('Students').map(r=>({id:r[0],name:r[1],grade:r[2],parentEmail:r[3],createdAt:r[5]}))
    .sort((a,b)=>a.name.localeCompare(b.name,'tr'));
}
function teacherCreateStudent(auth,data) {
  requireTeacher_(auth);
  const name=clean_(data.name,120), grade=clean_(data.grade,30), email=clean_(data.parentEmail,254).toLowerCase(), code=clean_(data.accessCode,100);
  if(!name||!grade||!email||!code) throw new Error('Tüm alanları doldurun.');
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Geçerli veli Google e-posta adresi girin.');
  if(code.length<6) throw new Error('Veli erişim kodu en az 6 karakter olmalı.');
  const id=id_(), ss=db_();
  ss.getSheetByName('Students').appendRow([id,name,grade,email,code,date_()]);
  ss.getSheetByName('Reports').appendRow([id,'',new Date()]);
  return {ok:true,id};
}
function teacherGetStudent(auth,studentId) {
  requireTeacher_(auth);
  const student=rows_('Students').find(r=>r[0]===String(studentId));
  if(!student) throw new Error('Öğrenci bulunamadı.');
  const entries=rows_('Entries').filter(r=>r[1]===String(studentId)).map(r=>({
    id:r[0],kind:r[2],section:r[3],subject:r[4],title:r[5],detail:r[6],score:r[7],date:r[8],createdAt:r[9]
  })).sort((a,b)=>b.date.localeCompare(a.date));
  const report=rows_('Reports').find(r=>r[0]===String(studentId));
  return {student:{id:student[0],name:student[1],grade:student[2],parentEmail:student[3]},entries,comment:report?report[1]:''};
}
function teacherAddEntry(auth,studentId,data) {
  requireTeacher_(auth);
  if(!rows_('Students').some(r=>r[0]===String(studentId))) throw new Error('Öğrenci bulunamadı.');
  const title=clean_(data.title,200);
  if(!title) throw new Error('Konu, kitap veya deneme adı zorunludur.');
  db_().getSheetByName('Entries').appendRow([
    id_(),String(studentId),clean_(data.kind,30),clean_(data.section,10),clean_(data.subject,100),
    title,clean_(data.detail,2000),clean_(data.score,100),clean_(data.date,10)||date_(),new Date()
  ]);
  return {ok:true};
}
function teacherDeleteEntry(auth,entryId) {
  requireTeacher_(auth);
  const sh=db_().getSheetByName('Entries'), vals=sh.getDataRange().getDisplayValues();
  for(let i=1;i<vals.length;i++) if(vals[i][0]===String(entryId)){sh.deleteRow(i+1);return {ok:true};}
  throw new Error('Kayıt bulunamadı.');
}
function teacherSaveComment(auth,studentId,comment) {
  requireTeacher_(auth);
  const sh=db_().getSheetByName('Reports'), vals=sh.getDataRange().getDisplayValues();
  for(let i=1;i<vals.length;i++) if(vals[i][0]===String(studentId)){
    sh.getRange(i+1,2).setValue(clean_(comment,6000));sh.getRange(i+1,3).setValue(new Date());return {ok:true};
  }
  sh.appendRow([String(studentId),clean_(comment,6000),new Date()]); return {ok:true};
}
function parentGetReport(childName,accessCode) {
  const email=String(Session.getActiveUser().getEmail()||'').toLowerCase();
  if(!email) throw new Error('Google hesabınızın e-posta adresi alınamadı. Dağıtım ayarlarında erişim izinlerini kontrol edin.');
  const student=rows_('Students').find(r=>r[1].toLowerCase()===clean_(childName,120).toLowerCase() && r[3].toLowerCase()===email && r[4]===clean_(accessCode,100));
  if(!student) throw new Error('Öğrenci adı, Google e-postası veya erişim kodu eşleşmedi.');
  const entries=rows_('Entries').filter(r=>r[1]===student[0]).map(r=>({id:r[0],kind:r[2],section:r[3],subject:r[4],title:r[5],detail:r[6],score:r[7],date:r[8]})).sort((a,b)=>b.date.localeCompare(a.date));
  const report=rows_('Reports').find(r=>r[0]===student[0]);
  return {student:{name:student[1],grade:student[2]},entries,comment:report?report[1]:''};
}
