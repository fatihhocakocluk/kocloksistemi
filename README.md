# Fatih Hoca Öğrenci Takip — Google Sites + Apps Script

Bu sürüm Node.js/npm gerektirmez. Arayüz Google Apps Script Web App olarak yayımlanır, kalıcı veri Google Sheets'te tutulur ve Google Sites sayfasına gömülür.

## Önemli Google hesabı / dağıtım notu
Bu uygulama, veli e-posta adresini `Session.getActiveUser().getEmail()` ile okumaya çalışır. Bu davranış hesap türü ve dağıtım politikasına göre değişebilir. `appsscript.json` varsayılanında `USER_ACCESSING` kullanılmıştır; Google, her kullanıcının yetkilendirmesini isteyebilir. Dağıtım ekranındaki erişim seçeneklerini dikkatle kontrol edin ve önce kendi iki ayrı test Google hesabınızla deneyin. E-posta boş geliyorsa veli doğrulaması güvenli biçimde çalışmayacaktır; herkese açık/anonim erişime geçip bu kontrolü kaldırmayın.

## 1) Apps Script projesi oluştur
1. https://script.google.com/ adresini açın ve Yeni proje oluşturun.
2. `Code.gs` dosyasının içeriğini bu paketteki `Code.gs` ile değiştirin.
3. `+` > HTML seçin, adını tam olarak `index` yapın ve `index.html` içeriğini yapıştırın.
4. Proje Ayarları'nda “appsscript.json manifest dosyasını düzenleyicide göster” seçeneğini açın; manifest içeriğini `appsscript.json` ile değiştirin.
5. Üstte fonksiyon listesinden `setup` seçin ve Çalıştır'a basın. İstenen Google Sheets izinlerini verin. Bir Google Sheets veritabanı otomatik oluşturulur; bağlantısını Apps Script yürütme günlüğünde görebilirsiniz.
6. Proje Ayarları > Komut dosyası özellikleri bölümünde `TEACHER_USERNAME` ve `TEACHER_PASSWORD` değerleri tanımlanabilir. İlk varsayılanlar `fatihhoca` ve `fatih45` olarak ayarlanmıştır. İnternete açmadan önce şifreyi değiştirin.
7. Dağıt > Yeni dağıtım > Tür seç > Web uygulaması. “Şu kullanıcı olarak yürüt” ve “Erişimi olanlar” seçeneklerini, Google hesabınızın gösterdiği seçeneklere göre seçin. Veli kimliğinin alınabildiğini test etmeden canlı kullanıma geçmeyin. Dağıtılan URL'yi kopyalayın.

## 2) Google Sites'a ekle
1. https://sites.google.com/ üzerinden sitenizi açın.
2. Ekle > Yerleştir > URL sekmesine geçin.
3. Apps Script dağıtım URL'sini yapıştırın ve ekleyin.
4. Sayfayı yayınlayın. Uygulama gömülü çerçevede açılır.

## Kullanım
- Öğretmen: `fatihhoca` / `fatih45` (ilk kurulum için; canlıya çıkmadan değiştirin).
- Öğretmen öğrenci oluştururken sınıf, veli Google e-postası ve en az 6 karakterlik erişim kodu girer.
- Veli Google hesabıyla giriş yapmış olmalı; çocuk adını ve öğretmenin verdiği erişim kodunu girer.
- Öğretmen ders/konu, TYT/AYT deneme, kitap ve diğer kayıtları ekler; yorum yazar; PDF butonu yazdırma penceresi açar. Açılan pencerede hedef olarak “PDF olarak kaydet” seçilir.
- Google Sheets verileri kalıcı tutar. Sheets'i silmeyin ve erişimini herkese açmayın.

## PDF indirme
PDF butonu tarayıcının yazdır penceresini açar. Yazıcı/hedef kısmından “PDF olarak kaydet” seçildiğinde dosya bilgisayara kaydedilir. Tarayıcıda açılır pencerelere izin vermek gerekebilir.

## Güvenlik uyarıları
- Öğrenci bilgileri hassas kişisel verilerdir. KVKK, veli bilgilendirmesi/uygun hukuki dayanak, veri minimizasyonu ve silme/yedekleme politikası uygulayın.
- İlk öğretmen şifresi sadece başlangıç içindir. Uygulama kodunda parola kontrolü yapılır; çok kullanıcılı/üretim ortamında Google hesabı tabanlı rol kontrolü ve daha güçlü sunucu tarafı kimlik doğrulama tercih edin.
- Erişim kodu şu başlangıç örneğinde Google Sheets'te düz metin olarak saklanır. Gerçek kullanımda erişim kodunu hash'leyin veya Firebase Authentication gibi güvenli bir kimlik doğrulama hizmeti kullanın.
- Google Sites embed izinleri ve Apps Script kimlik bilgisi erişimi Google hesap türü/kurum politikalarına göre farklı davranabilir. İki ayrı veli hesabıyla test edin; veli e-posta adresi boş gelirse sistemi bu haliyle yayımlamayın.
