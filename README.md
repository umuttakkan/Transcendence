Proje Açıklaması:
Transcendence, modern web teknolojileri kullanılarak geliştirilmiş, Django ve Three.js tabanlı bir oyun ve sosyal platformdur. SPA (Single Page Application) yapısında tasarlanmış olan bu platform, kullanıcıların oyun oynarken aynı zamanda sosyal etkileşimde bulunmasını sağlar.

Özellikler:
•	SPA Yapısı: Sayfa yenilemesi olmadan akıcı bir kullanıcı deneyimi.
•	Oyun Modları:
    o	Turnuva modu
    o	1v1 (Karşılıklı düello) modu
    o	Yapay zeka (AI) ile oyun oynama seçeneği
•	Çoklu Dil Desteği: Birden fazla dil seçeneği ile kullanıcı deneyimi iyileştirilmiştir.
•	Güvenlik:
    o	JWT (JSON Web Token) ile kimlik doğrulama
    o	2FA (İki Adımlı Doğrulama)
•	Özelleştirme: Oyuncuların oyun deneyimini kişiselleştirmelerine olanak tanıyan özellikler.
•	Kapsayıcılık: Modern tarayıcılarla geniş uyumluluk.
________________________________________
Teknik Detaylar:
Backend
•	Django Framework: Güçlü ve modüler backend yapısı.
•	Model-View-Serializer Yapısı: Kullanıcı, oyun ve maç geçmişi gibi verilerin yönetimi.
•	Veritabanı:
  o	PostgreSQL kullanılarak güvenli ve hızlı veri işlemleri sağlanmıştır.
  o	Kullanıcı şifreleri hashlenerek saklanmaktadır.
•	API Endpointleri:
  o	Kullanıcı kimlik doğrulama (Login/Register)
  o	Maç geçmişi ve skorlar
  o	Kullanıcı profili
Frontend
•	HTML, CSS ve Bootstrap: Responsive tasarım ve modern kullanıcı arayüzü.
•	JavaScript ve Three.js: 3D oyun motoru ile akıcı oyun deneyimi.
•	Token Yönetimi:
  o	Access Token ve Refresh Token işleyişi.
  o	Kullanıcı oturumu ve güvenlik kontrolü.
Docker ve Deployment
•	Docker Containers:
  o	PostgreSQL için container yapılandırması.
  o	Nginx ile uygulama servisi.
•	Nginx: Performans optimizasyonu ve yük dengeleme.
________________________________________
~Kurulum ve Çalıştırma
Gereksinimler:
•	Docker ve Docker Compose
•	Python 3.x
•	Node.js ve npm
Kurulum Adımları:
1.	Depoyu klonlayın:
git clone https://github.com/username/transcendence.git  
cd transcendence  
2.	Backend bağımlılıklarını yükleyin:
pip install -r requirements.txt  
3.	Frontend bağımlılıklarını yükleyin:
npm install  
4.	Başlatın:
make
6.	Uygulamaya erişin:
Tarayıcınızdan https://localhost:443 adresine gidin.
________________________________________
Kullanıcı Özellikleri
Kayıt ve Giriş:
•	42 Authorization: 42 ekosistemiyle entegre giriş yapabilirsiniz.
•	2FA Desteği: Güvenli giriş için iki adımlı doğrulama.
Oyun Sistemi:
•	Turnuva ve 1v1 Modları: Oyuncular arası rekabetçi modlar.
•	AI Modülü: Yapay zekaya karşı pratik yapma imkanı.
•	Match History: Tüm maç geçmişi ve skorlar profil sayfasında görüntülenebilir.
