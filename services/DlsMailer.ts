
export class DlsMailer {
  /**
   * Generuje i pobiera plik tekstowy z kodem weryfikacyjnym na komputer użytkownika.
   * Symuluje bezpieczne dostarczenie klucza w formie pliku (DLS-File-Protocol).
   */
  static async sendVerificationCode(email: string, code: string, username: string) {
    console.log(`[DLS-MAILER-PROTOCOL] Inicjalizacja transferu klucza dla: ${email}`);
    
    // Symulacja opóźnienia generowania klucza kryptograficznego
    await new Promise(r => setTimeout(r, 1200));
    
    // Treść pliku certyfikatu
    const fileContent = `
==================================================
DRIVESOFT DRIVE-LOGIN-SYSTEM (DLS 1.0) - SECURITY TOKEN
==================================================

UŻYTKOWNIK: ${username}
E-MAIL: ${email}
DATA GENEROWANIA: ${new Date().toLocaleString()}
SYSTEM: drivesoftware.pl Gateway v1.0.4

--------------------------------------------------
TWOJE HASŁO JEDNORAZOWE (OTP):
[ ${code} ]
--------------------------------------------------

UWAGA: Wpisz powyższy kod w oknie logowania DriveSoft.
Ten plik jest generowany automatycznie przez system DLS.
Nie udostępniaj tego pliku osobom trzecim.

© 2024 DriveSoft Systems | Karol Kopeć
==================================================
    `.trim();

    // Tworzenie bloba i pobieranie pliku
    const blob = new Blob([fileContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DLS_AUTH_TOKEN_${Math.random().toString(36).substr(2, 5).toUpperCase()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log(`[DLS-MAILER] Plik klucza został wysłany do strumienia pobierania.`);
    
    return true;
  }
}
