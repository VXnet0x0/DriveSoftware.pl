
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-gray-400 py-10 mt-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white text-lg font-bold mb-4">DriveSoft 2024</h3>
            <p className="text-sm leading-relaxed">
              Profesjonalna platforma dla twórców oprogramowania i entuzjastów technologii. 
              Budujemy przyszłość cyfrowej dystrybucji.
            </p>
          </div>
          <div>
            <h3 className="text-white text-lg font-bold mb-4">DLS 1.0 API</h3>
            <p className="text-sm">
              Nasz autorski system logowania "DriveLoginSystem" jest dostępny dla partnerów. 
              Skontaktuj się z nami, aby zintegrować swoją usługę.
            </p>
          </div>
          <div>
            <h3 className="text-white text-lg font-bold mb-4">Autor</h3>
            <p className="text-sm">
              Twórca: <span className="text-blue-400 font-bold">Karol Kopeć</span><br />
              Wszystkie prawa zastrzeżone © 2024<br />
              Website: <a href="https://drivesoftware.pl" className="hover:text-white">drivesoftware.pl</a>
            </p>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-xs">
          Built with React & TypeScript | Powered by DriveSoft AI 1.0 (DSAI1.0)
        </div>
      </div>
    </footer>
  );
};

export default Footer;
