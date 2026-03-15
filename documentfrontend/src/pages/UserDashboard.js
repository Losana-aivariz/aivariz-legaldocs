import React, { useState, useEffect } from "react";
import "./UserDashboard.css";
import { 
  FiFileText, FiEdit3, FiUsers, FiActivity, 
  FiBell, FiPlus, FiTrash2, FiDownload, FiCheck, FiRefreshCw, FiEye, 
  FiAlertCircle, FiLayers, FiClock, FiCheckCircle, FiSearch, FiCalendar,
  FiInbox, FiRotateCcw, FiXCircle, FiPhone, FiFolder, FiMaximize, FiMinimize, FiArrowLeft, FiArrowRight
} from "react-icons/fi";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

// --- ENGLISH DISTRICTS & TALUKS ---
const DISTRICTS_TALUKS_EN = {
  "Ariyalur": ["Andimadam", "Ariyalur", "Sendurai", "Udayarpalayam"],
  "Chengalpattu": ["Chengalpattu", "Cheyyur", "Madurantakam", "Pallavaram", "Tambaram", "Thiruporur", "Tirukalukundram", "Vandalur"],
  "Chennai": ["Alandur", "Ambattur", "Aminjikarai", "Ayanavaram", "Egmore", "Guindy", "Madhavaram", "Mambalam", "Mylapore", "Perambur", "Purasawalkam", "Sholinganallur", "Tondiarpet", "Velachery", "Thiruvottiyur"],
  "Coimbatore": ["Aanaimalai", "Annur", "Coimbatore North", "Coimbatore South", "Karamadai", "Kinathukadavu", "Madukkarai", "Mettupalayam", "Perur", "Pollachi", "Sulur", "Valparai"],
  "Cuddalore": ["Bhuvanagiri", "Chidambaram", "Cuddalore", "Kattumannarkoil", "Kurinjipadi", "Panruti", "Srimushnam", "Titagudi", "Veppur"],
  "Dharmapuri": ["Dharmapuri", "Harur", "Karimangalam", "Nallampalli", "Palacode", "Pappireddipatti", "Pennagaram"],
  "Dindigul": ["Dindigul East", "Dindigul West", "Gujiliamparai", "Kodaikanal", "Natham", "Nilakottai", "Oddanchatram", "Palani", "Vedasandur"],
  "Erode": ["Anthiyur", "Bhavani", "Erode", "Gobichettipalayam", "Kodumudi", "Modakkurichi", "Nambiyur", "Perundurai", "Sathyamangalam", "Thalavadi"],
  "Kallakurichi": ["Chinnasalem", "Kallakurichi", "Kalvarayan Hills", "Sankarapuram", "Tirukkovilur", "Ulundurpet"],
  "Kanchipuram": ["Kanchipuram", "Kundrathur", "Sriperumbudur", "Uthiramerur", "Walajabad"],
  "Kanyakumari": ["Agastheeswaram", "Kalkulam", "Killiyur", "Thiruvattar", "Thovalai", "Vilavancode"],
  "Karur": ["Aravakurichi", "Kadavur", "Karur", "Krishnarayapuram", "Kulithalai", "Manmangalam", "Pugalur"],
  "Krishnagiri": ["Anjetty", "Bargur", "Denkanikottai", "Hosur", "Krishnagiri", "Pochampalli", "Shoolagiri", "Uthangarai"],
  "Madurai": ["Kalligudi", "Madurai East", "Madurai North", "Madurai South", "Madurai West", "Melur", "Peraiyur", "Thirumangalam", "Thiruparankundram", "Usilampatti", "Vadipatti"],
  "Mayiladuthurai": ["Kuthalam", "Mayiladuthurai", "Sirkazhi", "Tharangambadi"],
  "Nagapattinam": ["Kilvelur", "Nagapattinam", "Thirukuvalai", "Vedaranyam"],
  "Namakkal": ["Kolli Hills", "Kumarapalayam", "Mohanur", "Namakkal", "Paramathi Velur", "Rasipuram", "Sendamangalam", "Tiruchengode"],
  "Nilgiris": ["Coonoor", "Gudalur", "Kotagiri", "Kundah", "Pandalur", "Udhagamandalam"],
  "Perambalur": ["Alathur", "Kunnam", "Perambalur", "Veppanthattai"],
  "Pudukkottai": ["Alangudi", "Aranthangi", "Avudayarkoil", "Gandarvakottai", "Illuppur", "Karambakkudi", "Kulathur", "Manamelkudi", "Ponnamaravathi", "Pudukkottai", "Thirumayam", "Viralimalai"],
  "Ramanathapuram": ["Kadaladi", "Kamuthi", "Keelakarai", "Mudukulathur", "Paramakudi", "Ramanathapuram", "Rameswaram", "Tiruvadanai"],
  "Ranipet": ["Arakkonam", "Arcot", "Nemili", "Walajah"],
  "Salem": ["Attur", "Edappadi", "Gangavalli", "Kadaiyampatti", "Mettur", "Omalur", "Pethanaickenpalayam", "Salem", "Salem South", "Salem West", "Sankari", "Vazhapadi", "Yercaud"],
  "Sivaganga": ["Devakottai", "Ilayangudi", "Kalaiyarkoil", "Karaikudi", "Manamadurai", "Singampunari", "Sivaganga", "Thirupuvanam", "Tirupathur"],
  "Tenkasi": ["Alangulam", "Kadayanallur", "Sankarankoil", "Shencottai", "Sivagiri", "Tenkasi", "Thiruvengadam", "V K Pudur"],
  "Thanjavur": ["Boothalur", "Kumbakonam", "Orathanadu", "Papanasam", "Pattukkottai", "Peravurani", "Thanjavur", "Thiruvaiyaru", "Thiruvidaimarudur"],
  "Theni": ["Andipatti", "Bodinayakanur", "Periyakulam", "Theni", "Uthamapalayam"],
  "Thoothukudi": ["Eral", "Ettayapuram", "Kovilpatti", "Ottapidaram", "Sathankulam", "Srivaikuntam", "Thoothukudi", "Tiruchendur", "Vilathikulam"],
  "Tiruchirappalli": ["Lalgudi", "Manachanallur", "Manapparai", "Marungapuri", "Musiri", "Srirangam", "Thiruverumbur", "Thuraiyur", "Tiruchirappalli East", "Tiruchirappalli West"],
  "Tirunelveli": ["Ambasamudram", "Cheranmahadevi", "Manur", "Nanguneri", "Palayamkottai", "Radhapuram", "Thisayanvilai", "Tirunelveli"],
  "Tirupathur": ["Ambur", "Natrampalli", "Tirupathur", "Vaniyambadi"],
  "Tiruppur": ["Avinashi", "Dharapuram", "Kangeyam", "Madathukulam", "Palladam", "Tiruppur North", "Tiruppur South", "Udumalaipettai", "Uthukuli"],
  "Tiruvallur": ["Ambattur", "Avadi", "Gummidipoondi", "Pallipattu", "Ponneri", "Poonamallee", "RK Pet", "Tiruvallur", "Uthukkottai"],
  "Tiruvannamalai": ["Arni", "Chengam", "Chetpet", "Cheyyar", "Kalasapakkam", "Kilpennathur", "Polur", "Thandarampet", "Tiruvannamalai", "Vandavasi"],
  "Tiruvarur": ["Kodavasal", "Koradacheri", "Mannargudi", "Nannilam", "Needamangalam", "Thiruthuraipoondi", "Tiruvarur", "Valangaiman"],
  "Vellore": ["Anekattu", "Gudiyatham", "K V Kuppam", "Katpadi", "Pernambut", "Vellore"],
  "Viluppuram": ["Gingee", "Kandachipuram", "Marakkanam", "Melmalaiyanur", "திண்டிவனம்", "வானூர்", "விக்கிரவாண்டி", "விழுப்புரம்"],
  "Virudhunagar": ["Aruppukkottai", "Kariapatti", "Rajapalayam", "Sattur", "Sivakasi", "Srivilliputhur", "Tiruchuli", "Vembakottai", "Virudhunagar", "Watrap"]
};

// --- TAMIL DISTRICTS & TALUKS ---
const DISTRICTS_TALUKS_TA = {
  "அரியலூர்": ["ஆண்டிமடம்", "அரியலூர்", "செந்துறை", "உடையார்பாளையம்"],
  "செங்கல்பட்டு": ["செங்கல்பட்டு", "செய்யூர்", "மதுராந்தகம்", "பல்லாவரம்", "தாம்பரம்", "திருப்போரூர்", "திருக்கழுக்குன்றம்", "வண்டலூர்"],
  "சென்னை": ["ஆலந்தூர்", "அம்பத்தூர்", "அமைந்தகரை", "அயனாவரம்", "எழும்பூர்", "கிண்டி", "மாதவரம்", "மாம்பலம்", "மயிலாப்பூர்", "பெரம்பூர்", "புரசைவாக்கம்", "சோழிங்கநல்லூர்", "தண்டையார்பேட்டை", "வேளச்சேரி", "திருவொற்றியூர்"],
  "கோயம்புத்தூர்": ["ஆனைமலை", "அன்னூர்", "கோயம்புத்தூர் வடக்கு", "கோயம்புத்தூர் தெற்கு", "காரமடை", "கிணத்துக்கடவு", "மதுக்கரை", "மேட்டுப்பாளையம்", "பேரூர்", "பொள்ளாச்சி", "சூலூர்", "வால்பாறை"],
  "கடலூர்": ["புவனகிரி", "சிதம்பரம்", "கடலூர்", "காட்டுமன்னார்கோயில்", "குறிஞ்சிப்பாடி", "பண்ருட்டி", "ஸ்ரீமுஷ்ணம்", "திட்டக்குடி", "வேப்பூர்"],
  "தருமபுரி": ["தருமபுரி", "அரூர்", "காரியமங்கலம்", "நல்லம்பள்ளி", "பாலைக்கோடு", "பாப்பிரெட்டிப்பட்டி", "பென்னாகரம்"],
  "திண்டுக்கல்": ["திண்டுக்கல் கிழக்கு", "திண்டுக்கல் மேற்கு", "குஜிலியம்பாறை", "கொடைக்கானல்", "நத்தம்", "நிலக்கோட்டை", "ஒட்டன்சத்திரம்", "பழனி", "வேடசந்தூர்"],
  "ஈரோடு": ["அந்தியூர்", "பவானி", "ஈரோடு", "கோபிச்செட்டிப்பாளையம்", "கொடுமுடி", "மொடக்குறிச்சி", "நம்பியூர்", "பெருந்துறை", "சத்தியமங்கலம்", "தாளவாடி"],
  "கள்ளக்குறிச்சி": ["சின்னசேலம்", "கள்ளக்குறிச்சி", "கல்வராயன் மலை", "சங்கராபுரம்", "திருக்கோவிலூர்", "உளுந்தூர்பேட்டை"],
  "காஞ்சிபுரம்": ["காஞ்சிபுரம்", "குன்றத்தூர்", "ஸ்ரீபெரும்புதூர்", "உத்திரமேரூர்", "வாலாஜாபாத்"],
  "கன்னியாகுமரி": ["அகஸ்தீஸ்வரம்", "கல்குளம்", "கிள்ளியூர்", "திருவட்டார்", "தோவாளை", "விளவங்கோடு"],
  "கரூர்": ["அரவக்குறிச்சி", "கடவூர்", "கரூர்", "கிருஷ்ணராயபுரம்", "குளித்தலை", "மண்மங்கலம்", "புகளூர்"],
  "கிருஷ்ணகிரி": ["அஞ்செட்டி", "பர்கூர்", "தேன்கனிக்கோட்டை", "ஓசூர்", "கிருஷ்ணகிரி", "போச்சம்பள்ளி", "சூளகிரி", "ஊத்தங்கரை"],
  "மதுரை": ["கள்ளிக்குடி", "மதுரை கிழக்கு", "மதுரை வடக்கு", "மதுரை தெற்கு", "மதுரை மேற்கு", "மேலூர்", "பேரையூர்", "திருமங்கலம்", "திருப்பரங்குன்றம்", "உசிலம்பட்டி", "வாடிப்பட்டி"],
  "மயிலாடுதுறை": ["குத்தாலம்", "மயிலாடுதுறை", "சீர்காழி", "தரங்கம்பாடி"],
  "நாகப்பட்டினம்": ["கீழ்வேளூர்", "நாகப்பட்டினம்", "திருக்குவளை", "வேதாரண்யம்"],
  "நாமக்கல்": ["கொல்லிமலை", "குமாரபாளையம்", "மோகனூர்", "நாமக்கல்", "பரமத்தி வேலூர்", "ராசிபுரம்", "சேந்தமங்கலம்", "திருச்செங்கோடு"],
  "நீலகிரி": ["குன்னூர்", "கூடலூர்", "கோத்தகிரி", "குந்தா", "பந்தலூர்", "உதகமண்டலம்"],
  "பெரம்பலூர்": ["ஆலத்தூர்", "குன்னம்", "பெரம்பலூர்", "வேப்பந்தட்டை"],
  "புதுக்கோட்டை": ["ஆலங்குடி", "அறந்தாங்கி", "ஆவுடையார்கோயில்", "கந்தர்வகோட்டை", "இலுப்பூர்", "கறம்பக்குடி", "குளத்தூர்", "மணமேல்குடி", "பொன்னமராவதி", "புதுக்கோட்டை", "திருமயம்", "விராலிமலை"],
  "இராமநாதபுரம்": ["கடலாடி", "கமுதி", "கீழக்கரை", "முதுகுளத்தூர்", "பரமக்குடி", "இராமநாதபுரம்", "ராமேஸ்வரம்", "திருவாடானை"],
  "ராணிப்பேட்டை": ["அரக்கோணம்", "ஆற்காடு", "நெமிலி", "வாலாஜா"],
  "சேலம்": ["ஆத்தூர்", "எடப்பாடி", "கெங்கவல்லி", "கடையாம்பட்டி", "மேட்டூர்", "ஓமலூர்", "பெத்தநாயக்கன்பாளையம்", "சேலம்", "சேலம் தெற்கு", "சேலம் மேற்கு", "சங்ககிரி", "வாழப்பாடி", "ஏற்காடு"],
  "சிவகங்கை": ["தேவகோட்டை", "இளையான்குடி", "காளையார்கோவில்", "காரைக்குடி", "மானாமதுரை", "சிங்கம்புணரி", "சிவகங்கை", "திருப்புவனம்", "திருப்பத்தூர்"],
  "தென்காசி": ["ஆலங்குளம்", "கடையநல்லூர்", "சங்கரன்கோவில்", "செங்கோட்டை", "சிவகிரி", "தென்காசி", "திருவேங்கடம்", "வீரகேரளம்புதூர்"],
  "தஞ்சாவூர்": ["பூதலூர்", "கும்பகோணம்", "ஒரத்தநாடு", "பாபநாசம்", "பட்டுக்கோட்டை", "பேராவூரணி", "தஞ்சாவூர்", "திருவையாறு", "திருவிடைமருதூர்"],
  "தேனி": ["ஆண்டிப்பட்டி", "போடிநாயக்கனூர்", "பெரியகுளம்", "தேனி", "உத்தமபாளையம்"],
  "தூத்துக்குடி": ["ஏரல்", "எட்டயபுரம்", "கோவில்பட்டி", "ஓட்டப்பிடாரம்", "சாத்தான்குளம்", "ஸ்ரீவைகுண்டம்", "தூத்துக்குடி", "திருச்செந்தூர்", "விளாத்திகுளம்"],
  "திருச்சிராப்பள்ளி": ["லால்குடி", "மண்ணச்சநல்லூர்", "மணப்பாறை", "மருங்காபுரி", "முசிறி", "ஸ்ரீரங்கம்", "திருவெறும்பூர்", "துறையூர்", "திருச்சிராப்பள்ளி கிழக்கு", "திருச்சிராப்பள்ளி மேற்கு"],
  "திருநெல்வேலி": ["அம்பாசமுத்திரம்", "சேரன்மகாதேவி", "மானூர்", "நாங்குநேரி", "பாளையங்கோட்டை", "ராதாபுரம்", "திசையன்விளை", "திருநெல்வேலி"],
  "திருப்பத்தூர்": ["ஆம்பூர்", "நாட்டறம்பள்ளி", "திருப்பத்தூர்", "வாணியம்பாடி"],
  "திருப்பூர்": ["அவிநாசி", "தாராபுரம்", "காங்கேயம்", "மடத்துக்குளம்", "பல்லடம்", "திருப்பூர் வடக்கு", "திருப்பூர் தெற்கு", "உடுமலைப்பேட்டை", "ஊத்துக்குளி"],
  "திருவள்ளூர்": ["அம்பத்தூர்", "ஆவடி", "கும்மிடிப்பூண்டி", "பள்ளிப்பட்டு", "பொன்னேரி", "பூந்தமல்லி", "ஆர்.கே. பேட்டை", "திருவள்ளூர்", "ஊத்துக்கோட்டை"],
  "திருவண்ணாமலை": ["ஆரணி", "செங்கம்", "சேத்துப்பட்டு", "செய்யார்", "கலசப்பாக்கம்", "கீழ்பென்னாத்தூர்", "போளூர்", "தண்டராம்பட்டு", "திருவண்ணாமலை", "வந்தவாசி"],
  "திருவாரூர்": ["குடவாசல்", "கொரடாச்சேரி", "மன்னார்குடி", "நன்னிலம்", "நீடாமங்கலம்", "திருத்துறைப்பூண்டி", "திருவாரூர்", "வலங்கைமான்"],
  "வேலூர்": ["அணைக்கட்டு", "குடியாத்தம்", "கே.வி. குப்பம்", "காட்பாடி", "பேர்ணாம்பட்டு", "வேலூர்"],
  "விழுப்புரம்": ["செஞ்சி", "கண்டாச்சிபுரம்", "மரக்காணம்", "மேல்மலையனூர்", "திண்டிவனம்", "வானூர்", "விக்கிரவாண்டி", "விழுப்புரம்"],
  "விருதுநகர்": ["அருப்புக்கோட்டை", "காரியாபட்டி", "ராஜபாளையம்", "சாத்தூர்", "சிவகாசி", "ஸ்ரீவில்லிபுத்தூர்", "திருச்சுழி", "வெம்பக்கோட்டை", "விருதுநகர்", "வத்திராயிருப்பு"]
};

// --- DEFAULT PINCODE MAPPING (HQ Pincodes) ---
const DEFAULT_PINCODES = {
  "Ariyalur": "621704", "Andimadam": "621801", "Sendurai": "621714", "Udayarpalayam": "621804",
  "Chengalpattu": "603001", "Tambaram": "600045", "Madurantakam": "603306",
  "Coimbatore North": "641018", "Coimbatore South": "641001", "Pollachi": "642001",
  "Madurai North": "625002", "Madurai South": "625001", "Melur": "625106",
  "Chennai": "600001", "Egmore": "600008", "Mylapore": "600004", "Velachery": "600042",
  "Tiruppur North": "641602", "Tiruppur South": "641604", "Palladam": "641664",
  "அரியலூர்": "621704", "ஆண்டிமடம்": "621801", "செந்துறை": "621714", "உடையார்பாளையம்": "621804",
  "செங்கல்பட்டு": "603001", "தாம்பரம்": "600045", "மதுராந்தகம்": "603306",
  "கோயம்புத்தூர் வடக்கு": "641018", "கோயம்புத்தூர் தெற்கு": "641001", "பொள்ளாச்சி": "642001",
  "மதுரை வடக்கு": "625002", "மதுரை தெற்கு": "625001", "மேலூர்": "625106",
  "சென்னை": "600001", "எழும்பூர்": "600008", "மயிலாப்பூர்": "600004", "வேளச்சேரி": "600042",
  "திருப்பூர் வடக்கு": "641602", "திருப்பூர் தெற்கு": "641604", "பல்லடம்": "641664"
};

const getPincodeForTaluk = (talukName) => {
  return DEFAULT_PINCODES[talukName] || "";
};

const getDistrictsDict = (lang) => lang === 'ta' ? DISTRICTS_TALUKS_TA : DISTRICTS_TALUKS_EN;

// --- CUSTOM SMART TRANSLATOR COMPONENT ---
const SmartTamilInput = ({ value, onChangeText, name, className, list }) => {
  const [localValue, setLocalValue] = useState(value || "");
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    setLocalValue(value || "");
  }, [value]);

  const handleBlur = async () => {
    if (/[a-zA-Z]/.test(localValue)) {
      setIsTranslating(true);
      try {
        const response = await fetch(
          `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ta&dt=t&q=${encodeURIComponent(localValue)}`
        );
        const data = await response.json();
        const translatedText = data[0].map((item) => item[0]).join('');
        
        setLocalValue(translatedText);
        onChangeText(translatedText);
      } catch (error) {
        console.error("Translation error:", error);
        onChangeText(localValue); 
      } finally {
        setIsTranslating(false);
      }
    } else {
      onChangeText(localValue);
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', display: 'flex' }}>
      <input
        type="text"
        name={name}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={handleBlur}
        className={className}
        list={list}
        placeholder="Type English & click outside to translate..."
        style={{ width: '100%' }}
        autoComplete="off"
      />
      {isTranslating && (
        <div style={{ 
          position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', 
          fontSize: '11px', color: '#10b981', fontWeight: 'bold', background: 'white', padding: '0 4px'
        }}>
          Translating...
        </div>
      )}
    </div>
  );
};
// ------------------------------------------

const convertNumberToWords = (amount) => {
  const num = parseInt(amount, 10);
  if (isNaN(num) || num === 0) return "";

  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const numStr = num.toString();
  if (numStr.length > 9) return 'Amount too large';

  const n = ('000000000' + numStr).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return "";

  let str = '';
  str += (Number(n[1]) !== 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
  str += (Number(n[2]) !== 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
  str += (Number(n[3]) !== 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
  str += (Number(n[4]) !== 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
  str += (Number(n[5]) !== 0) ? ((str !== '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
  
  return str.trim();
};

const logActivity = (email, actionType, details) => {
  const now = new Date();
  const newActivity = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      email: email,
      action: actionType,
      details: details,
      date: now.toLocaleDateString(),
      day: now.toLocaleDateString("en-US", { weekday: "long" }),
      time: now.toLocaleTimeString()
  };
  const existing = JSON.parse(localStorage.getItem("app_activities") || "[]");
  localStorage.setItem("app_activities", JSON.stringify([newActivity, ...existing]));
};

const getActivityStyle = (action) => {
  if (action.includes("Client")) return { icon: <FiUsers />, color: "#10b981", bg: "#d1fae5" }; 
  if (action.includes("Draft") && !action.includes("Deleted")) return { icon: <FiEdit3 />, color: "#3b82f6", bg: "#dbeafe" }; 
  if (action.includes("Deleted")) return { icon: <FiTrash2 />, color: "#ef4444", bg: "#fee2e2" }; 
  return { icon: <FiActivity />, color: "#64748b", bg: "#f1f5f9" }; 
};

const getNotificationStyle = (message, status) => {
  let borderLeft = "4px solid #3b82f6"; 
  let bg = status === "unread" ? "#eff6ff" : "#f8fafc";
  let icon = <FiBell color="#3b82f6" size={20} />;

  if (message.toLowerCase().includes("rejected")) {
    borderLeft = "4px solid #f59e0b"; 
    bg = status === "unread" ? "#fffbeb" : "#f8fafc";
    icon = <FiAlertCircle color="#f59e0b" size={20} />;
  } else if (message.toLowerCase().includes("approved")) {
    borderLeft = "4px solid #10b981"; 
    bg = status === "unread" ? "#ecfdf5" : "#f8fafc";
    icon = <FiCheckCircle color="#10b981" size={20} />;
  }
  return { borderLeft, bg, icon };
};

const templates = {
  "Sale Deed": "/templates/sale_deed.pdf",
  "Sale Agreement": "/templates/sale_agreement_deed.pdf", 
  "Power of Attorney": "/templates/power_deed.pdf",
  "Settlement Deed": "/templates/settlement_deed.pdf",
  "Release Deed": "/templates/release_deed.pdf",
  "Memorandum of Title": "/templates/MOT_deed.pdf"
};

const STATUS_STEPS = ["Draft Prepared", "Pending Verification", "Final Status"];

const initialDraftState = {
  id: null, 
  language: "ta",
  clientName: "", clientPhone: "", deedType: "Sale Agreement", isImportant: false,
  place: "", executionDate: "",
  sellerName: "", sellerRelation: "", sellerRelativeName: "", sellerAge: "", sellerPan: "", sellerAddress: "", sellerDistrict: "", sellerTaluk: "", sellerPincode: "",
  purchaserName: "", purchaserRelation: "", purchaserRelativeName: "", purchaserAge: "", purchaserPan: "", purchaserAddress: "", purchaserDistrict: "", purchaserTaluk: "", purchaserPincode: "",
  propertyDistrict: "", propertySubRegistry: "", propertyTaluk: "", propertyVillage: "", propertyStreet: "", propertyPincode: "",
  priorDocYear: "", priorDocNo: "",
  totalAmount: "", totalAmountWords: "", advanceAmount: "", advanceAmountWords: "", advanceMode: "",
  timeLimitMonths: "", timeLimitDate: "",
  pattaNo: "", tsNo: "", landArea: "",
  boundaryNorth: "", boundarySouth: "", boundaryEast: "", boundaryWest: "",
  ebNo: "", waterNo: "",
  originalOwner: "", originalOwnerAcquirer: "", legalHeirCertNo: "", wrongDocNo: "", wrongDocYear: "", wrongPurchaser: "",
  wrongRegistrationDate: "", heir1: "", heir2: "", witness1: "", witness2: "", propertyPanchayat: "", propertyUnion: "",
  mortgagorIndName: "", mortgagorIndRelation: "", mortgagorIndRelative: "", mortgagorIndAddress: "", mortgagorIndAadhaar: "",
  mortgagorCorpName: "", mortgagorCorpRepType: "", mortgagorCorpRepName: "", mortgagorCorpAddress: "", mortgagorCorpPan: "",
  bankName: "Karnataka Bank Ltd.", bankBranch: "", bankRepName: "",
  loanAmount: "", loanAmountWords: "", sanctionRefNo: "", sanctionDate: "",
  doc1Date: "", doc1Desc: "", doc1Type: "Original",
  doc2Date: "", doc2Desc: "", doc2Type: "Original",
  doc3Date: "", doc3Desc: "", doc3Type: "Xerox",
  doc4Date: "", doc4Desc: "", doc4Type: "Xerox",
  doc5Date: "", doc5Desc: "", doc5Type: "Xerox",
  settlementRelation: "", propertyDerivation: "",
};

export default function UserDashboard() {
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem("lastActiveUserTab") || "viewAllTracking";
  });
  const [selectedDeed, setSelectedDeed] = useState("Sale Agreement");
  const [clients, setClients] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activities, setActivities] = useState([]);
  const [previewDraft, setPreviewDraft] = useState(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [clientForm, setClientForm] = useState({ name: "", phone: "" });
  const [clientSearch, setClientSearch] = useState(""); 
  
  const [viewAllSearchDate, setViewAllSearchDate] = useState("");
  const [activitySearchDate, setActivitySearchDate] = useState(new Date().toISOString().split("T")[0]);
  const [notifSearchDate, setNotifSearchDate] = useState("");
  const [showDeletedNotifs, setShowDeletedNotifs] = useState(false); 
  
  const [draftForm, setDraftForm] = useState(initialDraftState);
  const [draftLanguage, setDraftLanguage] = useState(null); 
  const [formErrors, setFormErrors] = useState({}); 
  const [currentStep, setCurrentStep] = useState(0); 
  
  const [currentUser, setCurrentUser] = useState({
    name: "Staff User", email: "staff@suldm.com", role: "Staff", profilePic: null
  });

  const [modal, setModal] = useState({
    show: false, type: "alert", title: "", message: "", onConfirm: null, inputValue: ""
  });

  const [pdfViewer, setPdfViewer] = useState({ show: false, pdfBase64: null, draft: null, fullScreen: false });

  useEffect(() => {
    localStorage.setItem("lastActiveUserTab", activeTab);
  }, [activeTab]);

  const isRelease = draftForm.deedType === "Release Deed";
  const isMOT = draftForm.deedType === "Memorandum of Title";
  const isSettlement = draftForm.deedType === "Settlement Deed";

  const formSections = [
    { title: "Tracking & Execution Details", fields: [
      { label: draftLanguage === 'en' ? "Client Name (Tracking)" : "Client Name", name: "clientName", isEnglishOnly: true },
      { label: draftLanguage === 'en' ? "Client Phone (Tracking)" : "Client Phone", name: "clientPhone", type: "number" },
      { label: draftLanguage === 'en' ? "Place" : "இடம் (Place)", name: "place" },
      { label: draftLanguage === 'en' ? "Execution Date" : "தேதி (Date)", name: "executionDate", type: "date" }
    ]},
    { title: isMOT ? "Mortgagor Details (Party 1)" : (isRelease ? (draftLanguage === 'en' ? "Releasee Details (1st Party)" : "பெறுபவர் விவரங்கள் (1-வது பார்ட்டி)") : (isSettlement ? (draftLanguage === 'en' ? "Settlor Details (1st Party)" : "எழுதிக் கொடுப்பவர் விவரங்கள் (1-வது பார்ட்டி)") : (draftLanguage === 'en' ? "Seller Details (1st Party)" : "விற்பவர் விவரங்கள் (1-வது பார்ட்டி)"))), fields: isMOT ? [
      { label: "Individual Name", name: "mortgagorIndName" },
      { label: "Relation", name: "mortgagorIndRelation", type: "datalist", options: ["S/o", "D/o", "W/o"] },
      { label: "Relative Name", name: "mortgagorIndRelative" },
      { label: "Address", name: "mortgagorIndAddress" },
      { label: "Aadhaar No", name: "mortgagorIndAadhaar", isEnglishOnly: true },
      { label: "Company Name (If any)", name: "mortgagorCorpName" },
      { label: "Rep Type", name: "mortgagorCorpRepType", type: "datalist", options: ["Proprietor", "Partner", "Director"] },
      { label: "Rep Name", name: "mortgagorCorpRepName" },
      { label: "Company Address", name: "mortgagorCorpAddress" },
      { label: "Company PAN", name: "mortgagorCorpPan", isEnglishOnly: true }
    ] : [
      { label: draftLanguage === 'en' ? "Name" : "பெயர் (Name)", name: "sellerName" },
      { label: draftLanguage === 'en' ? "Relation (Son of/Wife of)" : "உறவு முறை (மகன்/மனைவி)", name: "sellerRelation", type: "datalist", options: draftLanguage === 'en' ? ["Son of", "Daughter of", "Wife of", "Husband of", "Care of"] : ["மகன்", "மகள்", "மனைவி", "கணவர்", "பாதுகாவலர்"] },
      { label: draftLanguage === 'en' ? "Relative's Name" : "உறவினர் பெயர்", name: "sellerRelativeName" },
      { label: draftLanguage === 'en' ? "Age" : "வயது (Age)", name: "sellerAge", type: "number" },
      { label: draftLanguage === 'en' ? "Aadhar/PAN" : "ஆதார்/PAN", name: "sellerPan", isEnglishOnly: true },
      { label: draftLanguage === 'en' ? "District" : "மாவட்டம் (District)", name: "sellerDistrict", type: "select", options: Object.keys(getDistrictsDict(draftLanguage)).sort() },
      { label: draftLanguage === 'en' ? "Taluk" : "வட்டம்/தாலுகா", name: "sellerTaluk", type: "select", dynamicOptions: (form) => (getDistrictsDict(draftLanguage)[form.sellerDistrict || ""] || []).sort() },
      { label: draftLanguage === 'en' ? "Address" : "முகவரி (Address)", name: "sellerAddress" },
      { label: draftLanguage === 'en' ? "Pincode" : "அஞ்சல் குறியீடு", name: "sellerPincode", type: "number", isEnglishOnly: true }
    ]},
    { title: isMOT ? "Bank & Loan Details (Mortgagee)" : (isRelease ? (draftLanguage === 'en' ? "Releasor Details (2nd Party)" : "எழுதிக் கொடுப்பவர் விவரங்கள் (2-வது பார்ட்டி)") : (isSettlement ? (draftLanguage === 'en' ? "Settlee Details (2nd Party)" : "எழுதிப் பெறுபவர் விவரங்கள் (2-வது பார்ட்டி)") : (draftLanguage === 'en' ? "Purchaser Details (2nd Party)" : "வாங்குபவர் விவரங்கள் (2-வது பார்ட்டி)"))), fields: isMOT ? [
      { label: "Bank Name", name: "bankName" },
      { label: "Branch Name", name: "bankBranch" },
      { label: "Branch Manager Name", name: "bankRepName" },
      { label: "Loan Amount", name: "loanAmount", type: "number" },
      { label: "Loan Amount (Words)", name: "loanAmountWords" },
      { label: "Sanction Ref No", name: "sanctionRefNo" },
      { label: "Sanction Date", name: "sanctionDate", type: "date" }
    ] : [
      { label: draftLanguage === 'en' ? "Name" : "பெயர் (Name)", name: "purchaserName" },
      { label: draftLanguage === 'en' ? "Relation (Son of/Wife of)" : "உறவு முறை (மகன்/மனைவி)", name: "purchaserRelation", type: "datalist", options: draftLanguage === 'en' ? ["Son of", "Daughter of", "Wife of", "Husband of", "Care of"] : ["மகன்", "மகள்", "மனைவி", "கணவர்", "பாதுகாவலர்"] },
      { label: draftLanguage === 'en' ? "Relative's Name" : "உறவினர் பெயர்", name: "purchaserRelativeName" },
      { label: draftLanguage === 'en' ? "Age" : "வயது (Age)", name: "purchaserAge", type: "number" },
      { label: draftLanguage === 'en' ? "Aadhar/PAN" : "ஆதார்/PAN", name: "purchaserPan", isEnglishOnly: true },
      { label: draftLanguage === 'en' ? "District" : "மாவட்டம் (District)", name: "purchaserDistrict", type: "select", options: Object.keys(getDistrictsDict(draftLanguage)).sort() },
      { label: draftLanguage === 'en' ? "Taluk" : "வட்டம்/தாலுகா", name: "purchaserTaluk", type: "select", dynamicOptions: (form) => (getDistrictsDict(draftLanguage)[form.purchaserDistrict || ""] || []).sort() },
      { label: draftLanguage === 'en' ? "Address" : "முகவரி (Address)", name: "purchaserAddress" },
      { label: draftLanguage === 'en' ? "Pincode" : "அஞ்சல் குறியீடு", name: "purchaserPincode", type: "number", isEnglishOnly: true }
    ]},
    { title: isMOT ? "Title Deeds Deposited (Schedule 1)" : (isRelease ? "Release & Document Details" : (isSettlement ? "Settlement & Document Details" : "Financial & Agreement Details")), fields: isMOT ? [
      { label: "Doc 1 Date", name: "doc1Date", type: "date" },
      { label: "Doc 1 Description", name: "doc1Desc" },
      { label: "Doc 1 Type", name: "doc1Type", type: "datalist", options: ["Original", "Xerox", "Certified Copy"] },
      { label: "Doc 2 Date", name: "doc2Date", type: "date" },
      { label: "Doc 2 Description", name: "doc2Desc" },
      { label: "Doc 2 Type", name: "doc2Type", type: "datalist", options: ["Original", "Xerox", "Certified Copy"] },
      { label: "Doc 3 Date", name: "doc3Date", type: "date" },
      { label: "Doc 3 Description", name: "doc3Desc" },
      { label: "Doc 3 Type", name: "doc3Type", type: "datalist", options: ["Original", "Xerox", "Certified Copy"] },
      { label: "Doc 4 Date", name: "doc4Date", type: "date" },
      { label: "Doc 4 Description", name: "doc4Desc" },
      { label: "Doc 4 Type", name: "doc4Type", type: "datalist", options: ["Original", "Xerox", "Certified Copy"] },
      { label: "Doc 5 Date", name: "doc5Date", type: "date" },
      { label: "Doc 5 Description", name: "doc5Desc" },
      { label: "Doc 5 Type", name: "doc5Type", type: "datalist", options: ["Original", "Xerox", "Certified Copy"] },
    ] : (isRelease ? [
      { label: draftLanguage === 'en' ? "Original Owner Name" : "ஆதி உரிமையாளர் (விற்றவர்)", name: "originalOwner" },
      { label: draftLanguage === 'en' ? "Acquirer Name" : "சொத்தை வாங்கியவர்", name: "originalOwnerAcquirer" },
      { label: draftLanguage === 'en' ? "Original Doc Year" : "மூல ஆவண வருடம்", name: "priorDocYear", type: "number" },
      { label: draftLanguage === 'en' ? "Original Doc No" : "மூல ஆவண எண்", name: "priorDocNo", type: "number" },
      { label: draftLanguage === 'en' ? "Legal Heir Cert No" : "வாரிசு சான்றிதழ் எண் (ப.மு.எண்)", name: "legalHeirCertNo" },
      { label: draftLanguage === 'en' ? "Legal Heir 1 Name" : "வாரிசு 1-ன் பெயர்", name: "heir1" },
      { label: draftLanguage === 'en' ? "Legal Heir 2 Name" : "வாரிசு 2-ன் பெயர்", name: "heir2" },
      { label: draftLanguage === 'en' ? "Wrong Registration Date" : "தவறுதலான பதிவு தேதி", name: "wrongRegistrationDate", type: "date" },
      { label: draftLanguage === 'en' ? "Wrong Purchaser Name" : "தவறுதலாக பதிவு பெற்றவர்", name: "wrongPurchaser" },
      { label: draftLanguage === 'en' ? "Wrongly Reg Doc Year" : "தவறுதலான ஆவண வருடம்", name: "wrongDocYear", type: "number" },
      { label: draftLanguage === 'en' ? "Wrongly Reg Doc No" : "தவறுதலான ஆவண எண்", name: "wrongDocNo", type: "number" },
      { label: draftLanguage === 'en' ? "Property Value" : "சொத்தின் மதிப்பு", name: "totalAmount", type: "number" },
      { label: draftLanguage === 'en' ? "Value in Words" : "மதிப்பு எழுத்தால்", name: "totalAmountWords" }
    ] : (isSettlement ? [
      { label: draftLanguage === 'en' ? "Relationship (Settlee to Settlor)" : "உறவுமுறை (எ.கா: தங்கை/மகன்)", name: "settlementRelation" },
      { label: draftLanguage === 'en' ? "Property Acquired Via" : "சொத்து வந்த வழி (எ.கா: கிரயப் பத்திரம்/வாரிசு)", name: "propertyDerivation" },
      { label: draftLanguage === 'en' ? "Prior Doc Year" : "முந்தைய ஆவண வருடம்", name: "priorDocYear", type: "number" },
      { label: draftLanguage === 'en' ? "Prior Doc No" : "முந்தைய ஆவண எண்", name: "priorDocNo", type: "number" },
    ] : [
      { label: draftLanguage === 'en' ? "Prior Doc Year" : "முந்தைய ஆவண வருடம்", name: "priorDocYear", type: "number" },
      { label: draftLanguage === 'en' ? "Prior Doc No" : "முந்தைய ஆவண எண்", name: "priorDocNo", type: "number" },
      { label: draftLanguage === 'en' ? "Total Amount" : "மொத்த கிரையத் தொகை", name: "totalAmount", type: "number" },
      { label: draftLanguage === 'en' ? "Amount in Words" : "தொகை எழுத்தால்", name: "totalAmountWords" },
      { label: draftLanguage === 'en' ? "Advance Amount" : "முன்பணம்", name: "advanceAmount", type: "number" },
      { label: draftLanguage === 'en' ? "Advance in Words" : "முன்பணம் எழுத்தால்", name: "advanceAmountWords" },
      { label: draftLanguage === 'en' ? "Payment Mode" : "பணம் செலுத்திய விதம்", name: "advanceMode" },
      { label: draftLanguage === 'en' ? "Time Limit (Months)" : "காலக்கெடு மாதங்கள்", name: "timeLimitMonths", type: "number" },
      { label: draftLanguage === 'en' ? "Time Limit Date" : "காலக்கெடு தேதி", name: "timeLimitDate", type: "date" }
    ]))},
    { title: "Property Schedule", fields: [
      { label: draftLanguage === 'en' ? "District" : "சொத்து மாவட்டம்", name: "propertyDistrict", type: "select", options: Object.keys(getDistrictsDict(draftLanguage)).sort() },
      { label: draftLanguage === 'en' ? "Sub-Registry" : "சார்பதிவாளர் அலுவலகம்", name: "propertySubRegistry" },
      { label: draftLanguage === 'en' ? "Taluk" : "சொத்து வட்டம்/தாலுகா", name: "propertyTaluk", type: "select", dynamicOptions: (form) => (getDistrictsDict(draftLanguage)[form.propertyDistrict || ""] || []).sort() },
      { label: draftLanguage === 'en' ? "Village/Muni" : "கிராமம்/நகராட்சி", name: "propertyVillage" },
      ...(isRelease || isMOT || isSettlement ? [
          { label: draftLanguage === 'en' ? "Panchayat" : "பஞ்சாயத்து", name: "propertyPanchayat" },
          { label: draftLanguage === 'en' ? "Panchayat Union" : "பஞ்சாயத்து யூனியன்", name: "propertyUnion" }
      ] : []),
      { label: draftLanguage === 'en' ? "Street" : "தெரு (Street)", name: "propertyStreet" },
      { label: draftLanguage === 'en' ? "Pincode" : "அஞ்சல் குறியீடு", name: "propertyPincode", type: "number", isEnglishOnly: true },
      { label: draftLanguage === 'en' ? "Patta No" : "பட்டா எண்", name: "pattaNo", isEnglishOnly: true },
      { label: draftLanguage === 'en' ? "Survey/T.S. No" : "சர்வே எண்", name: "tsNo", isEnglishOnly: true },
      { label: draftLanguage === 'en' ? "Land Area" : "மொத்த விஸ்தீரணம்", name: "landArea" },
      { label: draftLanguage === 'en' ? "Boundary North" : "வடக்கு எல்லை", name: "boundaryNorth" },
      { label: draftLanguage === 'en' ? "Boundary South" : "தெற்கு எல்லை", name: "boundarySouth" },
      { label: draftLanguage === 'en' ? "Boundary East" : "கிழக்கு எல்லை", name: "boundaryEast" },
      { label: draftLanguage === 'en' ? "Boundary West" : "மேற்கு எல்லை", name: "boundaryWest" },
      ...(isRelease || isMOT || isSettlement ? [
          { label: draftLanguage === 'en' ? "Witness 1 Name" : "சாட்சி 1 பெயர்", name: "witness1" },
          { label: draftLanguage === 'en' ? "Witness 2 Name" : "சாட்சி 2 பெயர்", name: "witness2" }
      ] : [
          { label: draftLanguage === 'en' ? "EB No" : "மின் இணைப்பு எண்", name: "ebNo", isEnglishOnly: true },
          { label: draftLanguage === 'en' ? "Water Conn No" : "குடிநீர் இணைப்பு எண்", name: "waterNo", isEnglishOnly: true }
      ])
    ]}
  ];

  const triggerAlert = (title, message) => {
    setModal({ show: true, type: "alert", title, message, onConfirm: null, inputValue: "" });
  };

  const triggerConfirm = (title, message, onConfirm) => {
    setModal({ show: true, type: "confirm", title, message, onConfirm, inputValue: "" });
  };

  // CLIENTS - BACKEND
  const fetchClientsFromDB = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/clients");
      if (res.ok) {
        const data = await res.json();
        setClients(data);
      }
    } catch (err) {
      console.error("Failed to fetch clients from DB:", err);
    }
  };

  // DRAFTS - BACKEND
  const fetchDraftsFromDB = async (email) => {
    try {
      const res = await fetch(`http://localhost:5000/api/drafts?email=${email}`);
      if (res.ok) {
        const data = await res.json();
        setDrafts(data);
      }
    } catch (err) {
      console.error("Failed to fetch drafts from DB:", err);
    }
  };

  // NOTIFICATIONS - LOCAL STORAGE
  const fetchNotificationsFromDB = async (email) => {
    try {
      const data = JSON.parse(localStorage.getItem("app_notifications") || "[]");
      setNotifications(data.filter(n => n.forUser === email || n.forUser === "all"));
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  // ACTIVITIES - LOCAL STORAGE
  const fetchActivitiesFromDB = async () => {
    try {
      const data = JSON.parse(localStorage.getItem("app_activities") || "[]");
      setActivities(data);
    } catch (err) {
      console.error("Failed to fetch activities", err);
    }
  };

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("currentStaff"));
    const userEmail = savedUser ? savedUser.email : "staff@suldm.com";
    if (savedUser) setCurrentUser(savedUser);

    fetchClientsFromDB();
    fetchDraftsFromDB(userEmail);
    fetchNotificationsFromDB(userEmail);
    fetchActivitiesFromDB();

    const interval = setInterval(() => {
      fetchDraftsFromDB(userEmail);
      fetchNotificationsFromDB(userEmail);
      fetchActivitiesFromDB();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleViewPdf = async (doc) => {
    if (doc.pdfAttachment) {
      setPdfViewer({ show: true, pdfBase64: doc.pdfAttachment, draft: doc, fullScreen: false });
      return;
    }
    try {
      const response = await fetch(`http://localhost:5000/api/drafts/${doc.id}/pdf`);
      const data = await response.json();
      if (data && data.pdfBase64) {
        setPdfViewer({ show: true, pdfBase64: data.pdfBase64, draft: doc, fullScreen: false });
      } else {
        triggerAlert("Notice", "This document does not have a PDF attached in the Database.");
      }
    } catch (error) {
      console.error(error);
      triggerAlert("Error", "Could not fetch PDF from the server.");
    }
  };

  const handleDownloadPdf = async (doc) => {
    const triggerDownload = (base64) => {
      const link = document.createElement("a");
      link.href = base64;
      link.download = `${doc.deedType.replace(/\s+/g, '_')}_${doc.clientName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    if (doc.pdfAttachment) {
      return triggerDownload(doc.pdfAttachment);
    }
    try {
      const response = await fetch(`http://localhost:5000/api/drafts/${doc.id}/pdf`);
      const data = await response.json();
      if (data && data.pdfBase64) {
        triggerDownload(data.pdfBase64);
      }
    } catch (error) {
      triggerAlert("Error", "Could not fetch the PDF from the server for downloading.");
    }
  };

  const moveToTrashNotification = async (id) => {
    try {
        const notifs = JSON.parse(localStorage.getItem("app_notifications") || "[]");
        const updated = notifs.map(n => n.id === id ? { ...n, isDeleted: true } : n);
        localStorage.setItem("app_notifications", JSON.stringify(updated));
        fetchNotificationsFromDB(currentUser.email);
    } catch (err) {
        console.error(err);
    }
  };

  const restoreNotification = async (id) => {
    try {
        const notifs = JSON.parse(localStorage.getItem("app_notifications") || "[]");
        const updated = notifs.map(n => n.id === id ? { ...n, isDeleted: false } : n);
        localStorage.setItem("app_notifications", JSON.stringify(updated));
        fetchNotificationsFromDB(currentUser.email);
    } catch (err) {
        console.error(err);
    }
  };

  const deleteNotificationPermanently = (id) => {
    triggerConfirm("Confirm Delete", "Are you sure you want to permanently delete this notification?", async () => {
        try {
            const notifs = JSON.parse(localStorage.getItem("app_notifications") || "[]");
            const updated = notifs.filter(n => n.id !== id);
            localStorage.setItem("app_notifications", JSON.stringify(updated));
            fetchNotificationsFromDB(currentUser.email);
        } catch (err) {
            console.error(err);
        }
    });
  };

  const markAsRead = async (id) => {
    try {
        const notifs = JSON.parse(localStorage.getItem("app_notifications") || "[]");
        const updated = notifs.map(n => n.id === id ? { ...n, status: "read" } : n);
        localStorage.setItem("app_notifications", JSON.stringify(updated));
        fetchNotificationsFromDB(currentUser.email);
    } catch (err) {
        console.error(err);
    }
  };

  const unreadCount = notifications.filter((n) => n.status === "unread" && !n.isDeleted).length;

  const handleMarkDraftAsRead = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/drafts/${id}/read`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" }
      });
      if (response.ok) {
         fetchDraftsFromDB(currentUser.email);
      }
    } catch (err) {
      console.error("Failed to mark draft as read:", err);
    }
  };

  const handleDeleteDraftRecord = (id) => {
    triggerConfirm("Delete Record", "Are you sure you want to permanently delete this draft record from your history?", async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/drafts/${id}`, {
          method: "DELETE"
        });
        if (response.ok) {
          fetchDraftsFromDB(currentUser.email);
          logActivity(currentUser.email, "Draft Record Deleted", `Deleted history record for Draft ID: ${id}`);
        } else {
          triggerAlert("Error", "Failed to delete record from DB.");
        }
      } catch(err) {
        console.error("Delete failed", err);
      }
    });
  };

  const getStepIndex = (status) => {
    if (status === "Prepared") return 0;
    if (status === "Pending") return 1;
    if (status === "Approved" || status === "Rejected") return 2;
    return 0;
  };

  // ADD CLIENT - BACKEND
  const handleAddClient = async () => {
    if (!clientForm.name || !clientForm.phone) return triggerAlert("Missing Info", "Please enter client name and mobile number.");
    
    if (!/^\d{10}$/.test(clientForm.phone)) {
        return triggerAlert("Validation Error", "Client Mobile Number must be exactly 10 digits.");
    }

    const isDuplicate = clients.some(c => c.name.toLowerCase() === clientForm.name.toLowerCase() && c.phone === clientForm.phone);
    if (isDuplicate) return triggerAlert("Duplicate Client", "A client with this exact Name and Mobile Number already exists.");
    
    try {
      const response = await fetch("http://localhost:5000/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clientForm)
      });

      if (response.ok) {
        logActivity(currentUser.email, "Client Registered", `Added client: ${clientForm.name}`);
        setClientForm({ name: "", phone: "" });
        fetchClientsFromDB(); 
        triggerAlert("Success", "Client added successfully to Database.");
      } else {
        triggerAlert("Error", "Failed to save client to Database.");
      }
    } catch (error) {
      console.error("API Error:", error);
      triggerAlert("Connection Error", "Could not connect to Database.");
    }
  };

  const validateStep = (stepIdx) => {
    let errors = {};
    let isValid = true;
    
    const fieldsToCheck = formSections[stepIdx].fields.map(f => f.name);
    
    fieldsToCheck.forEach(field => {
      const value = draftForm[field];
      if(isMOT && (field.includes('Corp') || field.includes('Ind') || field.includes('doc2') || field.includes('doc3') || field.includes('doc4') || field.includes('doc5') || field.includes('witness'))) return;
      
      if (value === undefined || value === null || value.toString().trim() === "") {
        errors[field] = "This field is required";
        isValid = false;
      }
    });

    if (stepIdx === 0) {
      if (draftForm.clientPhone && !/^\d{10}$/.test(draftForm.clientPhone)) {
          errors.clientPhone = "Must be exactly 10 digits";
          isValid = false;
      }
      
      if(isValid) {
          const isRegistered = clients.some((c) => c.name.toLowerCase() === draftForm.clientName.toLowerCase() && c.phone === draftForm.clientPhone);
          if (!isRegistered) {
              triggerAlert("Unregistered Client", "This client is not registered. Please register the client in the 'Clients' tab first.");
              isValid = false;
          }
      }
    }

    const panAadharRegex = /^([A-Z]{5}[0-9]{4}[A-Z]{1}|\d{12})$/i;
    if (stepIdx === 1 && draftForm.sellerPan && !panAadharRegex.test(draftForm.sellerPan)) {
        errors.sellerPan = "Invalid Format";
        isValid = false;
    }
    if (stepIdx === 2 && draftForm.purchaserPan && !panAadharRegex.test(draftForm.purchaserPan)) {
        errors.purchaserPan = "Invalid Format";
        isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleNextStep = () => {
      if (validateStep(currentStep)) {
          if (currentStep === 3) {
              setDraftForm(prev => ({
                  ...prev,
                  propertyDistrict: prev.propertyDistrict || prev.sellerDistrict,
                  propertyTaluk: prev.propertyTaluk || prev.sellerTaluk,
                  propertyPincode: prev.propertyPincode || prev.sellerPincode,
                  propertyStreet: prev.propertyStreet || prev.sellerAddress
              }));
          }

          setCurrentStep(prev => prev + 1);
          window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
          triggerAlert("Validation Error", "Please fill in all highlighted fields correctly before proceeding.");
      }
  };

  const handlePrevStep = () => {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrepareDraft = () => {
    if (!validateStep(4)) {
        return triggerAlert("Validation Error", "Please fill in all highlighted fields correctly before previewing.");
    }
    const prepared = { ...draftForm, id: draftForm.id || Date.now(), status: "Prepared", language: draftLanguage };
    setPreviewDraft(prepared);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmitDraft = async (draft) => {
    if (!draft) return;
    setIsGeneratingPdf(true);
    
    let pdfBase64 = null;
    let rawHTML = ""; // <--- WE WILL STORE THE TEXT HERE
    
    try {
      const element = document.getElementById('pdf-preview-container');
      if (element) {
        // CAPTURE THE EXACT RAW HTML TEXT BEFORE TAKING THE PICTURE
        rawHTML = element.innerHTML;

        const canvas = await html2canvas(element, { 
          scale: 2, 
          useCORS: true,
          backgroundColor: "#ffffff",
          scrollY: -window.scrollY // Fixes the grey box issue
        });
        
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const imgHeight = (canvas.height * pdfWidth) / canvas.width;
        
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft > 0) {
          position -= pageHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        pdfBase64 = pdf.output('datauristring');
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      triggerAlert("Warning", "Could not generate PDF attachment. Submitting data only.");
    }

    const now = new Date();
    const existingDraft = drafts.find(d => d.id === draft.id);
    const isResubmission = !!existingDraft;
    
    const submissionDetails = { 
      ...draft, 
      status: "Pending", 
      createdBy: currentUser.email, 
      isResubmitted: isResubmission, 
      staffRead: false, 
      submittedOn: { date: now.toLocaleDateString(), time: now.toLocaleTimeString(), day: now.toLocaleDateString("en-US", { weekday: "long" }) },
      pdfAttachment: pdfBase64,
      content: rawHTML // <--- THIS SENDS IT TO THE DATABASE SO ADMIN CAN SEE IT!
    };
    
    try {
      const response = await fetch("http://localhost:5000/api/drafts/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionDetails)
      });

      if (response.ok) {
        logActivity(currentUser.email, isResubmission ? "Draft Resubmitted" : "Draft Created", `${draft.deedType} for ${draft.clientName}`);
        
        const importancePrefix = draft.isImportant ? "[IMPORTANT] " : "";
        const submissionPrefix = isResubmission ? "RESUBMITTED" : "Request";
        
        const newNotif = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            message: `${importancePrefix}${submissionPrefix} from ${currentUser.name}: ${draft.deedType} for ${draft.clientName}`,
            draftId: draft.id,
            senderEmail: currentUser.email,
            forUser: "admin", 
            status: "unread",
            time: now.toLocaleTimeString(),
            date: now.toLocaleDateString(),
            isDeleted: false
        };
        const existingNotifs = JSON.parse(localStorage.getItem("app_notifications") || "[]");
        localStorage.setItem("app_notifications", JSON.stringify([newNotif, ...existingNotifs]));
        
        setIsGeneratingPdf(false);
        setPreviewDraft(null);
        setDraftForm(initialDraftState);
        setFormErrors({});
        setDraftLanguage(null);
        setCurrentStep(0);
        triggerAlert("Submission Successful", isResubmission ? "Draft Resubmitted to Database." : "Draft submitted to Database for Admin verification.");
        setActiveTab("statusTracking");
        
        fetchDraftsFromDB(currentUser.email);

      } else {
        triggerAlert("Error", "Failed to save draft to Database.");
        setIsGeneratingPdf(false);
      }
    } catch (error) {
      console.error("API Error:", error);
      triggerAlert("Connection Error", "Could not connect to Database.");
      setIsGeneratingPdf(false);
    }
  };
  const handleResubmitTrigger = (draft) => { 
    setDraftForm({ ...draft }); 
    setDraftLanguage(draft.language || "ta");
    setFormErrors({});
    setCurrentStep(0);
    setActiveTab("draftCreation"); 
  };

  const handleDraftChange = (e) => {
    const { name, value } = e.target;
    let updatedState = { ...draftForm, [name]: value };

    if (name === "sellerDistrict") { updatedState.sellerTaluk = ""; updatedState.sellerPincode = ""; }
    if (name === "purchaserDistrict") { updatedState.purchaserTaluk = ""; updatedState.purchaserPincode = ""; }
    if (name === "propertyDistrict") { updatedState.propertyTaluk = ""; updatedState.propertyPincode = ""; }

    if (name === "sellerTaluk") updatedState.sellerPincode = getPincodeForTaluk(value);
    if (name === "purchaserTaluk") updatedState.purchaserPincode = getPincodeForTaluk(value);
    if (name === "propertyTaluk") updatedState.propertyPincode = getPincodeForTaluk(value);

    if (formErrors[name]) {
        setFormErrors({ ...formErrors, [name]: null });
    }

    if (name === "totalAmount") updatedState.totalAmountWords = convertNumberToWords(value);
    if (name === "advanceAmount") updatedState.advanceAmountWords = convertNumberToWords(value);
    if (name === "loanAmount") updatedState.loanAmountWords = convertNumberToWords(value);

    setDraftForm(updatedState);
  };

  const handleSelectDeed = (deed) => { setSelectedDeed(deed); setDraftForm({ ...draftForm, deedType: deed }); };

  const getLocaleDateString = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return new Date(year, month - 1, day).toLocaleDateString();
  };

  const renderTrackingCardStepped = (d) => {
    return (
      <div key={d.id} className={`tracking-card ${d.status === 'Rejected' ? 'card-rejected' : ''} ${d.isImportant ? 'card-urgent' : ''}`} style={d.isImportant ? { borderLeft: '5px solid #ef4444' } : {}}>
        <div className="tracking-card-header">
          <div>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiFileText /> {d.deedType}
              {d.isImportant && <span style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#fee2e2', color: '#ef4444', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}><FiAlertCircle /> IMPORTANT</span>}
            </h4>
            <p>Client: {d.clientName}</p>
          </div>
          <div className="submission-time">{d.submittedOn?.day}<br/>{d.submittedOn?.date} | {d.submittedOn?.time}</div>
        </div>
        <div className="stepper">
          {STATUS_STEPS.map((step, idx) => {
            const currentIdx = getStepIndex(d.status);
            const isRejected = (idx === 2 && d.status === "Rejected");
            return (
              <div key={step} className={`step ${idx < currentIdx ? 'completed' : ''} ${idx === currentIdx ? 'active' : ''} ${isRejected ? 'is-rejected' : ''}`}>
                <div className="circle">{isRejected ? "✘" : (idx === 2 && d.status === "Approved" ? "✓" : (idx < currentIdx ? "✓" : idx + 1))}</div>
                <div className="label">{idx === 2 && d.status !== "Pending" ? d.status : step}</div>
                {idx !== STATUS_STEPS.length - 1 && <div className="line"></div>}
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "15px", gap: "10px", flexWrap: "wrap" }}>
          <div style={{ flex: 1 }}>
            {d.status === "Rejected" && (
              <div className="rejection-box" style={{ margin: 0 }}>
                <p className="rejection-warning-msg">⚠️ <b>Draft is Rejected.</b> make corrections and <b>Resubmit It</b></p>
                <button className="resubmit-btn" onClick={() => handleResubmitTrigger(d)}><FiRefreshCw /> Edit & Resubmit</button>
              </div>
            )}
          </div>
          <button onClick={() => handleMarkDraftAsRead(d.id)} style={{ padding: "8px 16px", background: "#f1f5f9", color: "#475569", border: "1px solid #cbd5e1", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", display: "flex", alignItems: "center", gap: "5px" }}>
            <FiCheck /> Mark as Read
          </button>
        </div>
      </div>
    );
  };

  const renderStatusBadge = (status, reason) => {
    let bg = "#f1f5f9", color = "#475569", icon = <FiClock size={16} />;
    if (status === "Approved") { bg = "#dcfce7"; color = "#16a34a"; icon = <FiCheckCircle size={16} />; }
    if (status === "Rejected") { bg = "#fee2e2"; color = "#ef4444"; icon = <FiXCircle size={16} />; }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: bg, color: color, padding: '6px 14px', borderRadius: '20px', fontWeight: 'bold', fontSize: '13px' }}>
          {icon} {status}
        </span>
        {status === "Rejected" && reason && (
          <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px', fontWeight: '600' }}>Reason: {reason}</span>
        )}
      </div>
    );
  };

  const generateDeedPreviewText = (d) => {
    const isEnglish = d.language === 'en';
    const isReleaseDeed = d.deedType === 'Release Deed';
    const isMOTDeed = d.deedType === 'Memorandum of Title';
    const isSettlementDeed = d.deedType === 'Settlement Deed';

    const getFormattedDate = (dateString) => {
      if(!dateString) return { year: "_____", month: "__________________", day: "_____" };
      const date = new Date(dateString);
      return {
        year: date.getFullYear(),
        month: date.toLocaleString('en-IN', { month: 'long' }),
        day: date.getDate()
      }
    };
    
    const formattedExecutionDate = getFormattedDate(d.executionDate);

    return (
      <div style={{ background: "#e2e8f0", padding: "20px", borderRadius: "8px", overflowX: "auto" }}>
        <div id="pdf-preview-container" style={{ 
            background: "white", color: "black", width: "210mm", minHeight: "297mm", 
            margin: "0 auto", padding: "20mm", boxSizing: "border-box", 
            fontFamily: isEnglish ? "'Times New Roman', serif" : "'Mukta Malar', 'Tamil Sangam MN', 'Times New Roman', serif", 
            fontSize: "12pt", lineHeight: "2", 
            boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
            /* --- ADD THESE 3 LINES --- */
            wordWrap: "break-word", 
            overflowWrap: "break-word", 
            whiteSpace: "pre-wrap"
          }}>
          
          <h2 style={{ textAlign: "center", textDecoration: "underline", marginBottom: "30px", fontWeight: "bold" }}>
            {isEnglish ? d.deedType.toUpperCase() : (isReleaseDeed ? "விடுதலை ஆவணம்" : (isSettlementDeed ? "தான செட்டில்மெண்ட் பத்திரம்" : (d.deedType === "Sale Agreement" ? "கிரைய ஒப்பந்தம்" : d.deedType.toUpperCase())))}
          </h2>

          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
             {isMOTDeed ? (
                <p>This Memorandum of Deposit of Title Deeds is executed on this <strong>{formattedExecutionDate.day}</strong> day of <strong>{formattedExecutionDate.month}</strong>, <strong>{formattedExecutionDate.year}</strong> by:</p>
             ) : (
                <>
                    <p><strong>{isEnglish ? "Date:" : "தேதி:"}</strong> {formattedExecutionDate.year} {isEnglish ? 'Year' : 'ம் வருடம்'} {formattedExecutionDate.month} {isEnglish ? 'Month' : 'மாதம்'} {formattedExecutionDate.day} {isEnglish ? 'Date' : 'ம் தேதி'} </p>
                    <p><strong>{isEnglish ? "Place:" : "இடம்:"}</strong> {d.place || "________________"}</p>
                </>
             )}
          </div>

          {isMOTDeed ? (
             <>
                {(d.mortgagorIndName) && (
                    <p>
                        <strong>Mr./Ms.</strong> <strong>{d.mortgagorIndName}</strong> <strong>{d.mortgagorIndRelation || "S/o"}</strong> <strong>{d.mortgagorIndRelative || "___________"}</strong> residing at <strong>{d.mortgagorIndAddress || "_____________________"}</strong> (Aadhaar Card No. <strong>{d.mortgagorIndAadhaar || "___________"}</strong>) (1)
                    </p>
                )}
                
                {(d.mortgagorIndName && d.mortgagorCorpName) && <p style={{textAlign:"center"}}><strong>AND</strong></p>}
                
                {(d.mortgagorCorpName) && (
                    <p>
                        <strong>M/s.</strong> <strong>{d.mortgagorCorpName}</strong> through its authorized <strong>{d.mortgagorCorpRepType || "Proprietor"}</strong> <strong>{d.mortgagorCorpRepName || "___________"}</strong> situated at <strong>{d.mortgagorCorpAddress || "_____________________"}</strong> (PAN No. <strong>{d.mortgagorCorpPan || "___________"}</strong>) (2)
                    </p>
                )}

                <p>hereinafter called the <strong>MORTGAGOR</strong> in favour of:</p>

                <p>
                    <strong>{d.bankName || "M/s Karnataka Bank Ltd."}</strong>, a scheduled Bank having its Head & Registered Office at Mangalore and one of its Branches at <strong>{d.bankBranch || "_____________________"}</strong> represented by its duly authorized Branch Manager, <strong>Mr./Ms.</strong> <strong>{d.bankRepName || "___________"}</strong> hereinafter called the <strong>Mortgagee</strong>.
                </p>

                <p>
                    <strong>WHEREAS</strong>, the Mortgagee-Bank has sanctioned the credit facilities aggregating to <strong>Rs.{d.loanAmount || "___________"}</strong> (<strong>Rupees {d.loanAmountWords || "_____________________"} Only</strong>), vide sanction Ref. No. <strong>{d.sanctionRefNo || "___________"}</strong> Dated <strong>{d.sanctionDate || "___________"}</strong> to the Mortgagor and it is one of the stipulations that the Mortgagor should mortgage his/her/its immovable property as security for recovering the ultimate balance which would remain due from the Mortgagor to the Mortgagee and the Mortgagor has consented to the same;
                </p>

                <p>
                    <strong>AND WHEREAS</strong> accordingly the Mortgagor on this <strong>{formattedExecutionDate.day}</strong> day of <strong>{formattedExecutionDate.month}</strong>, <strong>{formattedExecutionDate.year}</strong> has deposited at the <strong>{d.bankBranch || "___________"}</strong> Branch of {d.bankName || "M/s Karnataka Bank Ltd"}, being a branch situated within a notified town where mortgage by deposit of title deeds is permissible, the title deeds described in the First Schedule hereto relating to his/her property described in the Second Schedule hereto with an intent to create security thereon for the repayment of all the monies due under the aforesaid credit facility/ies.
                </p>

                <p>
                    <strong>NOW BY THIS MEMORANDUM OF DEPOSIT OF TITLE DEEDS</strong> the Mortgagor hereby confirms the aforesaid deposit of title deeds and holds out to the Mortgagee that the immoveable property covered by the title deeds deposited and mortgage so created shall be continuing security for the Bank to recover all moneys remaining due from the Borrower at any time in the aforesaid financial transaction or any other account. It is clarified by the Mortgagor that if the Mortgagor creates different mortgages, it shall be open to the Bank to bring separate suits to enforce different mortgages on the scheduled property/ies.
                </p>

                <h4 style={{textAlign:"center", marginTop:"30px", textDecoration:"underline"}}>FIRST SCHEDULE</h4>
                <p style={{textAlign:"center", marginBottom:"20px"}}>(List of Title Deeds deposited with the Bank)</p>
                <table style={{width: "100%", borderCollapse: "collapse", marginBottom: "30px"}}>
                    <thead>
                        <tr>
                            <th style={{border: "1px solid black", padding: "8px", textAlign: "left"}}>Sl. No.</th>
                            <th style={{border: "1px solid black", padding: "8px", textAlign: "left"}}>Date</th>
                            <th style={{border: "1px solid black", padding: "8px", textAlign: "left"}}>Description of Document</th>
                            <th style={{border: "1px solid black", padding: "8px", textAlign: "left"}}>Original / Xerox / Certified</th>
                        </tr>
                    </thead>
                    <tbody>
                        {d.doc1Date && (
                            <tr>
                                <td style={{border: "1px solid black", padding: "8px"}}>1.</td>
                                <td style={{border: "1px solid black", padding: "8px"}}>{d.doc1Date}</td>
                                <td style={{border: "1px solid black", padding: "8px"}}>{d.doc1Desc}</td>
                                <td style={{border: "1px solid black", padding: "8px"}}>{d.doc1Type}</td>
                            </tr>
                        )}
                        {d.doc2Date && (
                            <tr>
                                <td style={{border: "1px solid black", padding: "8px"}}>2.</td>
                                <td style={{border: "1px solid black", padding: "8px"}}>{d.doc2Date}</td>
                                <td style={{border: "1px solid black", padding: "8px"}}>{d.doc2Desc}</td>
                                <td style={{border: "1px solid black", padding: "8px"}}>{d.doc2Type}</td>
                            </tr>
                        )}
                        {d.doc3Date && (
                            <tr>
                                <td style={{border: "1px solid black", padding: "8px"}}>3.</td>
                                <td style={{border: "1px solid black", padding: "8px"}}>{d.doc3Date}</td>
                                <td style={{border: "1px solid black", padding: "8px"}}>{d.doc3Desc}</td>
                                <td style={{border: "1px solid black", padding: "8px"}}>{d.doc3Type}</td>
                            </tr>
                        )}
                        {d.doc4Date && (
                            <tr>
                                <td style={{border: "1px solid black", padding: "8px"}}>4.</td>
                                <td style={{border: "1px solid black", padding: "8px"}}>{d.doc4Date}</td>
                                <td style={{border: "1px solid black", padding: "8px"}}>{d.doc4Desc}</td>
                                <td style={{border: "1px solid black", padding: "8px"}}>{d.doc4Type}</td>
                            </tr>
                        )}
                        {d.doc5Date && (
                            <tr>
                                <td style={{border: "1px solid black", padding: "8px"}}>5.</td>
                                <td style={{border: "1px solid black", padding: "8px"}}>{d.doc5Date}</td>
                                <td style={{border: "1px solid black", padding: "8px"}}>{d.doc5Desc}</td>
                                <td style={{border: "1px solid black", padding: "8px"}}>{d.doc5Type}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
             </>
          ) : isReleaseDeed ? (
             isEnglish ? (
                <>
                  <p><strong>Party of the First Part (Releasee):</strong><br/>
                    Mr/Ms <strong>{d.sellerName || "_______"}</strong>, {d.sellerRelation || "Son/Wife/Daughter of"} <strong>{d.sellerRelativeName || "_______"}</strong> (Age: <strong>{d.sellerAge || "___"}</strong>, Aadhar: <strong>{d.sellerPan || "_______"}</strong>, Mobile: <strong>{d.clientPhone || "_______"}</strong>), residing at Door No: <strong>{d.sellerAddress || "_______"}</strong>, <strong>{d.sellerTaluk || "________"}</strong> Taluk, <strong>{d.sellerDistrict || "________"}</strong> District - <strong>{d.sellerPincode || "______"}</strong> (hereinafter called the Releasee / First Party).
                  </p>

                  <p><strong>Party of the Second Part (Releasor):</strong><br/>
                    Mr/Ms <strong>{d.purchaserName || "_______"}</strong>, {d.purchaserRelation || "Son/Wife/Daughter of"} <strong>{d.purchaserRelativeName || "_______"}</strong> (Age: <strong>{d.purchaserAge || "___"}</strong>, Aadhar: <strong>{d.purchaserPan || "_______"}</strong>, Mobile: <strong>{d.clientPhone || "_______"}</strong>), residing at Door No: <strong>{d.purchaserAddress || "_______"}</strong>, <strong>{d.purchaserTaluk || "________"}</strong> Taluk, <strong>{d.purchaserDistrict || "________"}</strong> District - <strong>{d.purchaserPincode || "______"}</strong> (hereinafter called the Releasor / Second Party).
                  </p>

                  <p style={{ marginTop: "20px", fontWeight: "bold" }}>
                    WHEREAS both the parties have mutually agreed to enter into this Deed of Release as follows:
                  </p>

                  <p><strong>Recitals & Original Title:</strong><br/>
                    The property described in the schedule below originally belonged to Mr/Ms. <strong>{d.originalOwner || "______"}</strong> and was registered in favor of Mr/Ms. <strong>{d.originalOwnerAcquirer || "______"}</strong> vide Document No. <strong>{d.priorDocNo || "________"}</strong> of Year <strong>{d.priorDocYear || "____"}</strong> at the <strong>{d.propertySubRegistry || "________"}</strong> Sub-Registry with Survey No. <strong>{d.tsNo || "____"}</strong> measuring <strong>{d.landArea || "____"}</strong> cents/acres.
                    <br/><br/>
                    Following this, as per the Tahsildar Legal Heir Certificate No. <strong>{d.legalHeirCertNo || "______"}</strong>, the legal heirs are 1. <strong>{d.heir1 || "______"}</strong> 2. <strong>{d.heir2 || "______"}</strong>.
                    <br/><br/>
                    However, on <strong>{d.wrongRegistrationDate || "____"}</strong> a deed (Family Settlement/Sale Deed) was mistakenly executed and registered in favor of Mr/Ms. <strong>{d.wrongPurchaser || "______"}</strong> vide Document No. <strong>{d.wrongDocNo || "________"}</strong> of Year <strong>{d.wrongDocYear || "____"}</strong> at the <strong>{d.propertySubRegistry || "________"}</strong> Sub-Registry.
                  </p>

                  <p><strong>Release of Rights:</strong><br/>
                    Unaware of the aforementioned mistaken registration by Mr/Ms. <strong>{d.wrongPurchaser || "______"}</strong>, we mistakenly obtained the same property again. Realizing that we do not have absolute title, and acknowledging that you are the absolute and true legal heirs to the property owned by your ancestor Mr/Ms. <strong>{d.originalOwner || "______"}</strong>, and noting that the Patta stands in your name, we hereby completely, out of our free will, release, relinquish, and assign all our rights and claims over the Schedule Property in your favor.
                  </p>
                </>
             ) : (
                <>
                  <p><strong>ஆவணம் எழுதி பெறுபவர்கள் (1-வது பார்ட்டி):</strong><br/>
                    <strong>{d.sellerDistrict || "________"}</strong> மாவட்டம், <strong>{d.sellerTaluk || "________"}</strong> வட்டம், <strong>{d.sellerAddress || "_________________________________"}</strong> கதவு எண்: _______ என்ற முகவரியில் வசித்து வரும் திரு. <strong>{d.sellerRelativeName || "_______"}</strong> அவர்களின் {d.sellerRelation || "குமாரர்/குமார்த்தி"} திரு/திருமதி. <strong>{d.sellerName || "_______"}</strong> (வயது: <strong>{d.sellerAge || "___"}</strong>, ஆதார் எண்: <strong>{d.sellerPan || "_______"}</strong>, மொபைல் எண்: <strong>{d.clientPhone || "_______"}</strong>) அவர்களுக்கு,
                  </p>

                  <p><strong>ஆவணம் எழுதி கொடுப்பவர்கள் (2-வது பார்ட்டி):</strong><br/>
                    <strong>{d.purchaserDistrict || "________"}</strong> மாவட்டம், <strong>{d.purchaserTaluk || "________"}</strong> வட்டம், <strong>{d.purchaserAddress || "_________________________________"}</strong> கதவு எண்: _______ என்ற முகவரியில் வசித்து வரும் திரு. <strong>{d.purchaserRelativeName || "_______"}</strong> அவர்களின் {d.purchaserRelation || "குமாரர்/குமார்த்தி/மனைவி"} திரு/திருமதி. <strong>{d.purchaserName || "_______"}</strong> (வயது: <strong>{d.purchaserAge || "___"}</strong>, ஆதார் எண்: <strong>{d.purchaserPan || "_______"}</strong>, மொபைல் எண்: <strong>{d.clientPhone || "_______"}</strong>) 
                  </p>

                  <p style={{ marginTop: "20px", fontWeight: "bold" }}>
                    ஆகிய நாங்கள் முழு சம்மதத்துடன் எழுதிக் கொடுத்த விடுதலை ஆவணம் என்னவென்றால்,
                  </p>

                  <p><strong>மூலப் பத்திர விபரம்:</strong><br/>
                    இதன் கீழே தபசில் கண்ட சொத்தானது ஆதியில் <strong>{d.propertySubRegistry || "________"}</strong> சார்பதிவாளர் அலுவலகம் ஆவண எண் <strong>{d.priorDocNo || "________"}</strong> / <strong>{d.priorDocYear || "____"}</strong>-ன் படி திரு. <strong>{d.originalOwner || "______"}</strong> என்பவரால் திரு. <strong>{d.originalOwnerAcquirer || "______"}</strong> என்பவருக்கு சர்வே எண் <strong>{d.tsNo || "____"}</strong>-ல் <strong>{d.landArea || "____"}</strong> சென்ட் / ஏக்கர் அளவு கிரையம் செய்யப்பட்டுள்ளது. 
                    <br/><br/>
                    அதன் பின்பு மேற்படி வாரிசுகளாக வட்டாட்சியர் அவர்களால் ப.மு.எண்: <strong>{d.legalHeirCertNo || "______"}</strong>-ன் படி 1. <strong>{d.heir1 || "______"}</strong> 2. <strong>{d.heir2 || "______"}</strong> ஆகியோர் வாரிசுகளாவர்.
                    <br/><br/>
                    ஆனால், அதன் பின்பு <strong>{d.wrongRegistrationDate || "____"}</strong> தேதியில் திரு. <strong>{d.originalOwnerAcquirer || "______"}</strong> என்பவர் தவறுதலாக திரு. <strong>{d.wrongPurchaser || "______"}</strong> என்பவருக்கு ஆவண எண் <strong>{d.wrongDocNo || "________"}</strong> / <strong>{d.wrongDocYear || "____"}</strong>-ன் படி <strong>{d.propertySubRegistry || "________"}</strong> சார்பதிவாளர் அலுவலகத்தில் சர்வே எண் <strong>{d.tsNo || "____"}</strong>-ல் ஏக்கர் <strong>{d.landArea || "____"}</strong> அளவுள்ள இடத்திற்கு குடும்ப ஏற்பாடு பத்திரம் / கிரையப் பத்திரம் தவறுதலாக பதிவு செய்யப்பட்டுள்ளது.
                  </p>

                  <p><strong>விடுதலைச் சரத்துகள்:</strong><br/>
                    தபசில் சொத்தை மேலே சொன்ன திரு. <strong>{d.wrongPurchaser || "______"}</strong> அவர்கள் பதிவு பெற்றதை அறியாமல் நாங்கள் அதே சொத்தை மீண்டும் மேலே குறிப்பிட்டபடி தவறுதலாக கிரையம் பெற்றுள்ளோம். ஆகவே, எங்களுக்கு பாத்தியதை இல்லாத சொத்தை தங்களின் தாத்தாவான / தந்தையான திரு. <strong>{d.originalOwner || "______"}</strong> என்பவருக்கு சொந்தமான சொத்தை தாங்கள் தான் உண்மையான வாரிசுகள் என்று தெரிந்தும், தங்கள் பெயரில் பட்டா உள்ளதை அறிந்தும் முழு சம்மதத்துடன் இந்த விடுதலை பத்திரம் எழுதிக் கொடுக்கிறோம்.
                  </p>
                </>
             )
          ) : isSettlementDeed ? (
             isEnglish ? (
                <>
                  <p><strong>Party of the First Part (Settlor):</strong><br/>
                    Mr/Ms <strong>{d.sellerName || "_______"}</strong>, {d.sellerRelation || "Son/Wife/Daughter of"} <strong>{d.sellerRelativeName || "_______"}</strong> (Age: <strong>{d.sellerAge || "___"}</strong>, Aadhar: <strong>{d.sellerPan || "_______"}</strong>), residing at <strong>{d.sellerAddress || "_________________________________"}</strong>, <strong>{d.sellerTaluk || "________"}</strong> Taluk, <strong>{d.sellerDistrict || "________"}</strong> District - <strong>{d.sellerPincode || "______"}</strong> (hereinafter called the Settlor).
                  </p>

                  <p><strong>Party of the Second Part (Settlee):</strong><br/>
                    Mr/Ms <strong>{d.purchaserName || "_______"}</strong>, {d.purchaserRelation || "Son/Wife/Daughter of"} <strong>{d.purchaserRelativeName || "_______"}</strong> (Age: <strong>{d.purchaserAge || "___"}</strong>, Aadhar: <strong>{d.purchaserPan || "_______"}</strong>), residing at <strong>{d.purchaserAddress || "_________________________________"}</strong>, <strong>{d.purchaserTaluk || "________"}</strong> Taluk, <strong>{d.purchaserDistrict || "________"}</strong> District - <strong>{d.purchaserPincode || "______"}</strong> (hereinafter called the Settlee).
                  </p>

                  <p style={{ marginTop: "20px", fontWeight: "bold" }}>
                    WHEREAS the Settlor and Settlee are related to each other as {d.settlementRelation || "_______"}.
                  </p>

                  <p><strong>Recitals & Original Title:</strong><br/>
                    WHEREAS the Settlor is the absolute owner of the property described in the schedule below, having acquired the same through <strong>{d.propertyDerivation || "_______"}</strong> vide Document No. <strong>{d.priorDocNo || "________"}</strong> of Year <strong>{d.priorDocYear || "____"}</strong> at the <strong>{d.propertySubRegistry || "________"}</strong> Sub-Registry.
                  </p>

                  <p><strong>Terms of Settlement:</strong><br/>
                    Out of natural love and affection that the Settlor bears towards the Settlee, and for their future welfare, the Settlor hereby settles, conveys, and assigns the Schedule Property to the Settlee absolutely and forever. The Settlee shall hereafter hold and enjoy the property with absolute rights, free from all encumbrances. The Settlor confirms that possession of the property has been handed over to the Settlee today. The Settlor states that there are no encumbrances over the property.
                  </p>
                </>
             ) : (
                <>
                  <p><strong>ஆவணம் எழுதி கொடுப்பவர் (1-வது பார்ட்டி - செட்டிலர்):</strong><br/>
                    <strong>{d.sellerDistrict || "________"}</strong> மாவட்டம், <strong>{d.sellerTaluk || "________"}</strong> வட்டம், <strong>{d.sellerAddress || "_________________________________"}</strong> என்ற முகவரியில் வசித்து வரும் திரு. <strong>{d.sellerRelativeName || "_______"}</strong> அவர்களின் {d.sellerRelation || "குமாரர்/குமார்த்தி"} திரு/திருமதி. <strong>{d.sellerName || "_______"}</strong> (வயது: <strong>{d.sellerAge || "___"}</strong>, ஆதார் எண்: <strong>{d.sellerPan || "_______"}</strong>, மொபைல் எண்: <strong>{d.clientPhone || "_______"}</strong>) அவர்களுக்கு,
                  </p>

                  <p><strong>ஆவணம் எழுதி பெறுபவர் (2-வது பார்ட்டி - செட்டிலீ):</strong><br/>
                    <strong>{d.purchaserDistrict || "________"}</strong> மாவட்டம், <strong>{d.purchaserTaluk || "________"}</strong> வட்டம், <strong>{d.purchaserAddress || "_________________________________"}</strong> என்ற முகவரியில் வசித்து வரும் திரு. <strong>{d.purchaserRelativeName || "_______"}</strong> அவர்களின் {d.purchaserRelation || "குமாரர்/குமார்த்தி/மனைவி"} திரு/திருமதி. <strong>{d.purchaserName || "_______"}</strong> (வயது: <strong>{d.purchaserAge || "___"}</strong>, ஆதார் எண்: <strong>{d.purchaserPan || "_______"}</strong>, மொபைல் எண்: <strong>{d.clientPhone || "_______"}</strong>) 
                  </p>

                  <p style={{ marginTop: "20px", fontWeight: "bold" }}>
                    ஆகிய நான் முழு சம்மதத்துடன் எழுதிக் கொடுத்த தான செட்டில்மெண்ட் பத்திரம் என்னவென்றால்,
                  </p>

                  <p><strong>உறவுமுறை மற்றும் காரணம்:</strong><br/>
                    தாங்கள் எனக்கு <strong>{d.settlementRelation || "_______"}</strong> ஆவீர்கள். உங்கள் பெயரில் எனக்குள்ள அன்பும் அபிமானத்தை உத்தேசித்தும், உங்கள் எதிர்கால நன்மையைக் கருதியும், உங்களுக்கு ஒரு ஏற்பாடு செய்து வைக்க வேண்டுமென்று முடிவு செய்து, அதனை நிறைவேற்றும் பொருட்டு என் மனபூர்வமாக இந்த தான செட்டில்மெண்ட் பத்திரத்தை எழுதி வைத்துள்ளேன்.
                  </p>

                  <p><strong>முன் ஆவண விபரம்:</strong><br/>
                    இதன் தபசில் கண்ட சொத்தானது எனக்கு <strong>{d.propertyDerivation || "_______"}</strong> மூலமாகப் பாத்தியப்பட்டு (ஆவண எண் <strong>{d.priorDocNo || "____"}</strong> / <strong>{d.priorDocYear || "____"}</strong>), என் பெயரில் சர்வ சுதந்திரமாக ஆண்டு அனுபவித்து வருகிறேன்.
                  </p>

                  <p><strong>செட்டில்மெண்ட் ஷரத்துகள்:</strong><br/>
                    நாளது தேதி முதல் இதன் தபசில் கண்ட சொத்தை நீங்களே சர்வ சுதந்திர செட்டில்மெண்ட் பாத்தியமாயும், புத்திர பௌத்திர பாரம்பரையாயும், தானாதி வினியோக விற்கிரையங்களுக்குப் பாத்தியஸ்தரமாயும் என்றென்றைக்கும் ஆண்டனுபவித்துக் கொள்வீராகவும். இந்த செட்டில்மெண்ட் சொத்தின்பேரில் எந்த விதமான வில்லங்கமும் இல்லை என்று உறுதியாகச் சொல்லுகிறேன். தற்போதைய தீர்வை மற்றும் வரி வகையறாக்கள் அனைத்தும் இன்று வரை நான் செலுத்தி விட்டபடியால், இனி வரக்கூடியவைகளை தாங்களே செலுத்திக் கொள்ள வேண்டியது.
                  </p>
                </>
             )
          ) : (
              isEnglish ? (
                <>
                  <p><strong>Party of the First Part (Seller):</strong><br/>
                    Mr/Ms <strong>{d.sellerName || "_______"}</strong>, {d.sellerRelation || "Son/Wife/Daughter of"} <strong>{d.sellerRelativeName || "_______"}</strong> (Age: <strong>{d.sellerAge || "___"}</strong>, Aadhar/PAN: <strong>{d.sellerPan || "_______"}</strong>), residing at <strong>{d.sellerAddress || "_________________________________"}</strong>, <strong>{d.sellerTaluk || "________"}</strong> Taluk, <strong>{d.sellerDistrict || "________"}</strong> District - <strong>{d.sellerPincode || "______"}</strong> (hereinafter called the Vendor / First Party).
                  </p>

                  <p><strong>Party of the Second Part (Purchaser):</strong><br/>
                    Mr/Ms <strong>{d.purchaserName || "_______"}</strong>, {d.purchaserRelation || "Son/Wife/Daughter of"} <strong>{d.purchaserRelativeName || "_______"}</strong> (Age: <strong>{d.purchaserAge || "___"}</strong>, Aadhar/PAN: <strong>{d.purchaserPan || "_______"}</strong>), residing at <strong>{d.purchaserAddress || "_________________________________"}</strong>, <strong>{d.purchaserTaluk || "________"}</strong> Taluk, <strong>{d.purchaserDistrict || "________"}</strong> District - <strong>{d.purchaserPincode || "______"}</strong> (hereinafter called the Purchaser / Second Party).
                  </p>

                  <p style={{ marginTop: "20px", fontWeight: "bold" }}>
                    WHEREAS both the parties have mutually agreed to enter into this agreement as follows:
                  </p>

                  <p><strong>Absolute Ownership:</strong><br/>
                    The Vendor is the absolute owner of the property described in the schedule below, situated at <strong>{d.propertyDistrict || "________"}</strong> Registration District, <strong>{d.propertySubRegistry || "________"}</strong> Sub-Registry, acquired vide Document No. <strong>{d.priorDocNo || "________"}</strong> of Year <strong>{d.priorDocYear || "____"}</strong>, and is in uninterrupted possession and enjoyment of the same. The Vendor assures that the property is free from all encumbrances.
                  </p>

                  <p><strong>Sale Consideration & Advance:</strong><br/>
                    The Vendor has agreed to sell and the Purchaser has agreed to purchase the schedule property for a total sale consideration of Rs.<strong>{d.totalAmount || "____________"}</strong>/- (Rupees <strong>{d.totalAmountWords || "________________________________"}</strong> only).<br/>
                    Out of the total consideration, the Vendor acknowledges receipt of an advance amount of Rs.<strong>{d.advanceAmount || "____________"}</strong>/- (Rupees <strong>{d.advanceAmountWords || "________________________________"}</strong> only) from the Purchaser via <strong>{d.advanceMode || "________________"}</strong> on this day.
                  </p>

                  <p><strong>Terms and Conditions:</strong><br/>
                    1. The Purchaser agrees to pay the balance sale consideration to the Vendor within a period of <strong>{d.timeLimitMonths || "____"}</strong> months (i.e., on or before <strong>{d.timeLimitDate || "____/____/20__"}</strong>).<br/>
                    2. Upon receipt of the full balance amount, the Vendor shall execute and register the Sale Deed in favor of the Purchaser or their nominee, handing over all original documents, Encumbrance Certificate (EC), Patta, and tax receipts.<br/>
                    3. If the Purchaser fails to pay the balance amount within the stipulated time, the advance paid shall stand forfeited.
                  </p>

                  <p>IN WITNESS WHEREOF both the parties have signed this agreement with free will and full understanding of the contents.</p>
                </>
              ) : (
                <>
                  <p><strong>1-வது பார்ட்டி (சொத்து விற்பவர்):</strong><br/>
                    <strong>{d.sellerDistrict || "________"}</strong> மாவட்டம், <strong>{d.sellerTaluk || "________"}</strong> வட்டம்/தாலுகா, <strong>{d.sellerAddress || "_________________________________"}</strong> - <strong>{d.sellerPincode || "______"}</strong> என்ற முகவரியில் வசித்து வரும் திரு/திருமதி <strong>{d.sellerRelativeName || "_______"}</strong> அவர்களின் {d.sellerRelation || "மகன்/மனைவி/மகள்"} திரு/திருமதி <strong>{d.sellerName || "_______"}</strong> (வயது: <strong>{d.sellerAge || "___"}</strong>, ஆதார் எண்/PAN: <strong>{d.sellerPan || "_______"}</strong>) (1-வது பார்ட்டி).
                  </p>

                  <p><strong>2-வது பார்ட்டி (சொத்து வாங்குபவர்):</strong><br/>
                    <strong>{d.purchaserDistrict || "________"}</strong> மாவட்டம், <strong>{d.purchaserTaluk || "________"}</strong> வட்டம்/தாலுகா, <strong>{d.purchaserAddress || "_________________________________"}</strong> - <strong>{d.purchaserPincode || "______"}</strong> என்ற முகவரியில் வசித்து வரும் திரு/திருமதி <strong>{d.purchaserRelativeName || "_______"}</strong> அவர்களின் {d.purchaserRelation || "மகன்/மனைவி/மகள்"} திரு/திருமதி <strong>{d.purchaserName || "_______"}</strong> (வயது: <strong>{d.purchaserAge || "___"}</strong>, ஆதார் எண்/PAN: <strong>{d.purchaserPan || "_______"}</strong>) (2-வது பார்ட்டி).
                  </p>

                  <p style={{ marginTop: "20px", fontWeight: "bold" }}>
                    ஆக நாம் 1, 2 பார்ட்டிகள் சேர்ந்து எழுதிக் கொண்ட நிலம்/வீடு கிரைய ஒப்பந்தம் என்னவென்றால்,
                  </p>

                  <p><strong>சொத்தின் முழு உரிமை:</strong><br/>
                    இதன் கீழே தபசில் கண்ட சொத்தானது <strong>{d.propertyDistrict || "________"}</strong> பதிவு மாவட்டம், <strong>{d.propertySubRegistry || "________"}</strong> சார்பதிவாளர் அலுவலகம், <strong>{d.priorDocYear || "____"}</strong>-ம் வருடத்திய <strong>{d.priorDocNo || "________"}</strong>-ஆவண எண்ணாக 1-வது பார்ட்டியாகிய எனக்கு கிடைக்கப் பெற்று, என் முழு சுவாதீன அனுபவத்தில் இருந்து வருகிறது. இச்சொத்தின் மீது வேறு எவ்வித வில்லங்கமோ இல்லை என 1-வது பார்ட்டி உறுதியளிக்கிறேன்.
                  </p>

                  <p><strong>கிரையத் தொகை மற்றும் முன்பணம்:</strong><br/>
                    நாம் இருவரும் மனப்பூர்வமாக சம்மதித்து செய்து கொண்ட ஒப்பந்தத்தின் அடிப்படையில், தபசில் சொத்தை 2-வது பார்ட்டியாகிய உங்களுக்கு விற்க முடிவு செய்து, அதற்கான மொத்த கிரையத் தொகையாக ரூ.<strong>{d.totalAmount || "____________"}</strong>/- (எழுத்தால் ரூபாய் <strong>{d.totalAmountWords || "________________________________"}</strong> மட்டும்) என நிர்ணயம் செய்யப்பட்டுள்ளது.<br/>
                    இத்தொகையில் அட்வான்ஸ் (முன்பணம்) தொகையாக ரூ.<strong>{d.advanceAmount || "____________"}</strong>/- (எழுத்தால் ரூபாய் <strong>{d.advanceAmountWords || "________________________________"}</strong> மட்டும்)-ஐ 2-வது பார்ட்டியாகிய தங்களிடமிருந்து 1-வது பார்ட்டியாகிய நான் <strong>{d.advanceMode || "இன்று நேரில் / காசோலை மூலம்"}</strong> பெற்றுக் கொண்டேன்.
                  </p>

                  <p><strong>காலக்கெடு மற்றும் நிபந்தனைகள்:</strong><br/>
                    1. மீதமுள்ள கிரையப் பாக்கித் தொகையை இன்று முதல் <strong>{d.timeLimitMonths || "____"}</strong> மாதங்களுக்குள் (அதாவது <strong>{d.timeLimitDate || "____/____/20__"}</strong> தேதிக்குள்) 2-வது பார்ட்டி 1-வது பார்ட்டியிடம் செலுத்திவிட வேண்டும்.<br/>
                    2. பாக்கித் தொகையை பெற்றுக் கொண்டவுடன், 1-வது பார்ட்டி தனது சொந்த செலவில் வில்லங்க சான்றிதழ் (EC), மூல ஆவணங்கள் (Original Documents), பட்டா, சிட்டா, மற்றும் வரி ரசீதுகளை ஒப்படைத்து, 2-வது பார்ட்டி அல்லது அவர் கைகாட்டும் நபரின் பெயரில் கிரையப் பத்திரம் பதிவு செய்து கொடுக்க வேண்டும்.<br/>
                    3. குறிப்பிட்ட காலக்கெடுவிற்குள் 2-வது பார்ட்டி மீதித் தொகையை செலுத்தத் தவறினால், கொடுத்த முன்பணம் திருப்பியளிக்கப்பட மாட்டாது.
                  </p>

                  <p>மேற்கண்ட நிபந்தனைகளுக்கு நாம் இருவரும் சம்மதித்து, மனப்பூர்வமாகப் படித்துப் பார்த்து இந்த கிரைய ஒப்பந்தத்தில் கையொப்பம் செய்துள்ளோம்.</p>
                </>
              )
          )}

          <div style={{ pageBreakInside: 'avoid', breakInside: 'avoid', display: 'inline-block', width: '100%' }}>
            <h3 style={{ textDecoration: "underline", marginTop: "30px", textAlign: "center" }}>
              {isMOTDeed ? "SECOND SCHEDULE" : (isEnglish ? "SCHEDULE OF PROPERTY" : "சொத்தின் தபசில் விபரம்")}
            </h3>
            {isMOTDeed && <p style={{textAlign:"center", marginBottom:"20px"}}>(Description of Mortgaged Property)</p>}

            <p>
              {isEnglish || isMOTDeed ? (
                <>Property situated in <strong>{d.propertyDistrict || "________"}</strong> Registration District, <strong>{d.propertySubRegistry || "________"}</strong> Sub-Registry, <strong>{d.propertyTaluk || "________"}</strong> Taluk, <strong>{d.propertyVillage || "________"}</strong> Village/Municipality. Patta No: <strong>{d.pattaNo || "________"}</strong> Resurvey No: <strong>{d.tsNo || "________"}</strong> Total Extent / Area: <strong>{d.landArea || "________"}</strong>.</>
              ) : (
                <><strong>{d.propertyDistrict || "________"}</strong> பதிவு மாவட்டம், <strong>{d.propertySubRegistry || "________"}</strong> சார்பதிவாளர் அலுவலக சரகம், <strong>{d.propertyTaluk || "________"}</strong> வட்டம், <strong>{d.propertyVillage || "________"}</strong> கிராமம் மாலிலில் பட்டா எண்: <strong>{d.pattaNo || "________"}</strong>-ல் கண்டபடி ரீசர்வே எண் <strong>{d.tsNo || "________"}</strong> நம்பர் புஞ்சை ஹெக்டேர் <strong>{d.landArea || "________"}</strong>-க்கு மாலாவது:</>
              )}
            </p>

            <p><strong>{isEnglish || isMOTDeed ? "Bounded on the:" : "நான்கு எல்லைகள் :"}</strong></p>
            <ul style={{ listStyleType: "none", paddingLeft: "40px", lineHeight: "2.5" }}>
              <li><strong>{isEnglish || isMOTDeed ? "North:" : "வடக்கு:"}</strong> {d.boundaryNorth || "________________________________"}</li>
              <li><strong>{isEnglish || isMOTDeed ? "South:" : "தெற்கு:"}</strong> {d.boundarySouth || "________________________________"}</li>
              <li><strong>{isEnglish || isMOTDeed ? "East:" : "கிழக்கு:"}</strong> {d.boundaryEast || "________________________________"}</li>
              <li><strong>{isEnglish || isMOTDeed ? "West:" : "மேற்கு:"}</strong> {d.boundaryWest || "________________________________"}</li>
            </ul>

            <p style={{ marginTop: "20px" }}>
              {isEnglish || isMOTDeed
                ? <>The property bounded within these four limits is confirmed. The property falls under the jurisdiction of <strong>{d.propertyPanchayat || "________"}</strong> Panchayat, <strong>{d.propertyUnion || "________"}</strong> Panchayat Union. {(isRelease || isMOTDeed || isSettlementDeed) ? "" : `Property Value: Rs. ${d.totalAmount || "________"}/-`}</> 
                : <>இந்த நான்கு எல்லைகளுக்கு உட்பட்ட புஞ்சை ஹெக்டேர் -க்கு ஏக்கர் -ம் தபசில் விபரம் சரி. ஷ சொத்து <strong>{d.propertyPanchayat || "________"}</strong> கிராமம் பஞ்சாயத்து <strong>{d.propertyUnion || "________"}</strong> பஞ்சாயத்து யூனியன் சரகத்திற்கு உட்பட்டது. {(isReleaseDeed || isSettlementDeed) ? "" : `சொத்தின் மதிப்பு: ரூ. ${d.totalAmount || "________"} /-`}</>}
            </p>
            
            {(isReleaseDeed || isMOTDeed || isSettlementDeed) && (
                <div style={{ marginTop: "40px" }}>
                    <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>{isEnglish || isMOTDeed ? "Witnesses (Name, Address & Signature):" : "சாட்சிகள் (பெயர், முகவரி மற்றும் கையொப்பம்):"}</p>
                    <p style={{ lineHeight: '2' }}>1. {d.witness1 || "____________________________________________________"}</p>
                    <p style={{ lineHeight: '2' }}>2. {d.witness2 || "____________________________________________________"}</p>
                    
                    <p style={{ fontWeight: 'bold', marginTop: '30px', marginBottom: '10px' }}>
                        {isMOTDeed ? "Signature of the Mortgagor:" : (isEnglish ? (isSettlementDeed ? "Signature of the Settlor (First Party):" : "Signature of the Releasor (Second Party):") : (isSettlementDeed ? "ஆவணம் எழுதி கொடுத்தவர் (1-வது பார்ட்டி) கையொப்பம்:" : "ஆவணம் எழுதி கொடுத்தவர்கள் (2-வது பார்ட்டி) கையொப்பம்:"))}
                    </p>
                    <p style={{ lineHeight: '2' }}>1. _______________________</p>
                    {(!isMOTDeed || (isMOTDeed && d.mortgagorCorpName)) && <p style={{ lineHeight: '2' }}>2. _______________________</p>}
                </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const tightBtnStyle = { 
    padding: '8px 18px', 
    margin: '2px 16px', 
    fontSize: '14px', 
    borderRadius: '8px' 
  };

  const filteredViewAllDrafts = drafts.filter(d => {
    if (!viewAllSearchDate) return true; 
    return d.submittedOn?.date === getLocaleDateString(viewAllSearchDate);
  });

  const displayedNotifications = notifications
    .filter(n => (showDeletedNotifs ? n.isDeleted : !n.isDeleted))
    .filter(n => {
      if (!notifSearchDate) return true;
      return n.date === getLocaleDateString(notifSearchDate);
    }); 

  const filteredClients = clients.filter(c => 
    (c.name || "").toLowerCase().includes((clientSearch || "").toLowerCase()) || 
    String(c.phone || "").includes(clientSearch || "")
  );

  return (
    <div className="staff-dashboard" style={{ position: "relative" }}>
      <div className="sidebar" style={{ display: "flex", flexDirection: "column", padding: "10px 0", height: "100vh", overflowY: "auto" }}>
        <div className="sidebar-header" style={{ marginBottom: '15px', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <h2 style={{ fontSize: '20px', letterSpacing: '2px', fontWeight: '800', margin: 0, color: 'white' }}>STAFF PAGE</h2>
        </div>
        
        <button className={activeTab === "deedTypes" ? "active" : ""} onClick={() => setActiveTab("deedTypes")} style={tightBtnStyle}><FiFileText /> Deed Templates</button>
        <button className={activeTab === "draftCreation" ? "active" : ""} onClick={() => { setActiveTab("draftCreation"); setDraftLanguage(null); setFormErrors({}); setCurrentStep(0); setPreviewDraft(null); }} style={tightBtnStyle}><FiEdit3 /> Draft Creation</button>
        <button className={activeTab === "clientCreation" ? "active" : ""} onClick={() => setActiveTab("clientCreation")} style={tightBtnStyle}><FiUsers /> Clients</button>
        <button className={activeTab === "statusTracking" ? "active" : ""} onClick={() => setActiveTab("statusTracking")} style={tightBtnStyle}><FiCheckCircle /> Status Tracking</button>
        <button className={activeTab === "viewAllTracking" ? "active" : ""} onClick={() => setActiveTab("viewAllTracking")} style={tightBtnStyle}><FiLayers /> View All</button>
        <button className={activeTab === "pdfArchive" ? "active" : ""} onClick={() => setActiveTab("pdfArchive")} style={tightBtnStyle}><FiFolder /> PDF Archive</button>
        <button className={activeTab === "dailyActivity" ? "active" : ""} onClick={() => setActiveTab("dailyActivity")} style={tightBtnStyle}><FiClock /> Daily Activities</button>
        
        <button 
          className={activeTab === "notifications" ? "active" : ""} 
          onClick={() => setActiveTab("notifications")} 
          style={{ ...tightBtnStyle, position: 'relative' }}
        >
          <FiBell /> Notifications
          {unreadCount > 0 && (
            <span style={{ position: 'absolute', right: '15px', background: '#ef4444', color: 'white', fontSize: '10px', padding: '2px 6px', borderRadius: '10px', fontWeight: 'bold' }}>{unreadCount}</span>
          )}
        </button>

        <div style={{ flexGrow: 1 }}></div>
      </div>

      <div className="content">
        <style>
          {`
            .page-transition-anim { animation: fadeSlideIn 0.3s ease-out forwards; height: 100%; width: 100%; }
            @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
            
            .language-btn { padding: 30px; border-radius: 16px; border: 2px solid #e2e8f0; background: white; cursor: pointer; transition: all 0.3s ease; flex: 1; min-width: 250px; font-size: 20px; font-weight: bold; color: #334155; display: flex; flex-direction: column; align-items: center; gap: 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
            .language-btn:hover { border-color: #4f46e5; transform: translateY(-5px); box-shadow: 0 10px 15px rgba(0,0,0,0.1); color: #4f46e5; }

            .wizard-progress { display: flex; gap: 5px; margin-bottom: 20px; }
            .wizard-step-dot { height: 8px; flex: 1; background: #e2e8f0; border-radius: 10px; transition: all 0.3s; }
            .wizard-step-dot.active { background: #3b82f6; }
            .wizard-step-dot.completed { background: #10b981; }

            .form-sections-container { display: flex; flex-direction: column; gap: 25px; margin-bottom: 30px; }
            .form-card-section { background: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.04); border: 1px solid #e2e8f0; animation: fadeSlideIn 0.3s ease; }
            .section-title { margin-top: 0; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid #f1f5f9; color: #1e293b; font-size: 18px; font-weight: 700; }
            .grid-form { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px; }
            
            .input-group { display: flex; flex-direction: column; gap: 6px; }
            .input-group label { font-size: 14px; font-weight: 600; color: #475569; }
            .input-group input, .input-group select { font-family: inherit; width: 100%; padding: 10px 12px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 15px; box-sizing: border-box; transition: all 0.2s; background: white; color: #0f172a; }
            .input-group input:focus, .input-group select:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
            .input-group input.input-error, .input-group select.input-error { border-color: #ef4444; background-color: #fef2f2; }
            .input-group input.input-error:focus, .input-group select.input-error:focus { box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2); }
            .error-text { color: #ef4444; font-size: 12px; font-weight: 600; margin-top: -2px; }
            
            .priority-checkbox { flex-direction: row; align-items: center; gap: 10px; background: #fef2f2; padding: 15px; border-radius: 8px; border: 1px dashed #f87171; }
            .priority-checkbox input { width: 20px; height: 20px; cursor: pointer; }
            .priority-checkbox label { margin: 0; color: #ef4444; font-weight: bold; cursor: pointer; font-size: 16px; display: flex; align-items: center; gap: 6px; }

            .wizard-actions { display: flex; justifyContent: space-between; margin-top: 30px; gap: 15px; }
            .wizard-actions button { padding: 12px 24px; font-size: 16px; border-radius: 8px; font-weight: bold; cursor: pointer; display: flex; alignItems: center; gap: 8px; transition: all 0.2s; }
            .btn-back { background: white; border: 1px solid #cbd5e1; color: #475569; }
            .btn-back:hover { background: #f8fafc; border-color: #94a3b8; }
            .btn-next { background: #3b82f6; border: none; color: white; margin-left: auto; }
            .btn-next:hover { background: #2563eb; transform: translateY(-1px); }

            .back-link { display: inline-flex; align-items: center; gap: 5px; color: #64748b; font-size: 14px; font-weight: 600; cursor: pointer; margin-bottom: 15px; transition: color 0.2s; }
            .back-link:hover { color: #0f172a; text-decoration: underline; }
          `}
        </style>

        <div key={activeTab} className="page-transition-anim">

          {activeTab === "pdfArchive" && (
            <div style={{ padding: "40px", background: "#f8fafc", minHeight: "100%" }}>
              <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "30px", color: "#0f172a", marginTop: 0 }}>
                <FiFolder style={{ color: "#4f46e5" }} /> My PDF Archive
              </h1>
              <p style={{ color: '#64748b', marginBottom: '25px' }}>Access and download the PDF documents you have generated and submitted.</p>
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "25px" }}>
                {drafts.length === 0 ? (
                  <div style={{ gridColumn: "1 / -1", textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '16px', border: '2px dashed #e2e8f0' }}>
                      <FiFolder size={40} style={{ color: '#cbd5e1', marginBottom: '15px' }} />
                      <h3 style={{ color: '#1e293b', marginBottom: '5px' }}>No PDFs Stored Yet</h3>
                      <p style={{ color: '#64748b' }}>When you generate drafts with PDF attachments, they will appear here.</p>
                  </div>
                ) : (
                  drafts.map(doc => (
                    <div key={doc.id} style={{ background: "white", padding: "25px", borderRadius: "16px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "15px" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "15px" }}>
                        <div style={{ background: "#eff6ff", padding: "12px", borderRadius: "12px", color: "#3b82f6" }}>
                          <FiFileText size={28} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <h3 style={{ margin: "0 0 5px 0", fontSize: "16px", color: "#1e293b", lineHeight: "1.3" }}>{doc.deedType}</h3>
                          <p style={{ margin: 0, fontSize: "14px", color: "#64748b" }}>{doc.clientName}</p>
                        </div>
                      </div>
                      
                      <div style={{ fontSize: "13px", color: "#94a3b8", display: "flex", justifyContent: "space-between", borderTop: "1px solid #f1f5f9", paddingTop: "15px", marginTop: "auto" }}>
                        <span>Status: <span style={{ color: doc.status === 'Approved' ? '#10b981' : doc.status === 'Pending' ? '#f59e0b' : '#ef4444', fontWeight: 'bold' }}>{doc.status}</span></span>
                        <span>{doc.submittedOn?.date || "Archived"}</span>
                      </div>

                      <div style={{ display: "flex", gap: "10px", marginTop: "5px" }}>
                        <button onClick={() => handleViewPdf(doc)} style={{ flex: 1, padding: "10px", background: "#f8fafc", color: "#334155", border: "1px solid #cbd5e1", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "5px" }}>
                          <FiEye /> View
                        </button>
                        <button onClick={() => handleDownloadPdf(doc)} style={{ flex: 1, padding: "10px", background: "#4f46e5", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "5px" }}>
                          <FiDownload /> Save
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === "dailyActivity" && (
            <div className="activity-section" style={{ background: "#f8fafc", padding: "40px", height: "100%", overflowY: "auto" }}>
              <div style={{ maxWidth: "800px", margin: "0 auto" }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#0f172a' }}>
                    <div style={{ background: '#3b82f6', color: 'white', padding: '10px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FiActivity size={24} />
                    </div>
                    <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold' }}>Daily Activities</h2>
                  </div>
                  
                  <div 
                    style={{ display: "flex", alignItems: "center", gap: "10px", background: "white", padding: "10px 18px", borderRadius: "12px", border: "1px solid #cbd5e1", boxShadow: "0 2px 5px rgba(0,0,0,0.02)", transition: "all 0.2s" }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = '#cbd5e1'}
                  >
                    <FiCalendar color="#64748b" size={18} />
                    <span style={{ color: "#64748b", fontSize: "14px", fontWeight: "600", marginRight: "5px" }}>Date:</span>
                    <input 
                      type="date" 
                      value={activitySearchDate}
                      onChange={(e) => setActivitySearchDate(e.target.value)}
                      style={{ border: "none", outline: "none", background: "transparent", color: "#0f172a", fontWeight: "700", fontSize: "14px", padding: 0, margin: 0, width: "auto", cursor: "pointer", fontFamily: "inherit" }}
                    />
                  </div>
                </div>
                
                <div className="timeline-container" style={{ background: "white", padding: "30px", borderRadius: "16px", boxShadow: "0 4px 15px rgba(0,0,0,0.03)", border: "1px solid #e2e8f0" }}>
                  {activities
                    .filter(log => log.email === currentUser.email)
                    .filter(log => log.action !== "Draft Record Deleted")
                    .filter(log => {
                        const searchFormatted = new Date(activitySearchDate).toLocaleDateString();
                        return log.date === searchFormatted;
                    })
                    .map((log, idx, arr) => {
                      const style = getActivityStyle(log.action);
                      const isLast = idx === arr.length - 1;
                      return (
                        <div key={log.id} style={{ display: "flex", gap: "20px", marginBottom: isLast ? "0" : "25px" }}>
                          
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: "44px" }}>
                            <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: style.bg, color: style.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", zIndex: 2, boxShadow: "0 0 0 4px white" }}>
                              {style.icon}
                            </div>
                            {!isLast && <div style={{ width: "2px", background: "#f1f5f9", flex: 1, marginTop: "5px" }}></div>}
                          </div>
                          
                          <div style={{ flex: 1, paddingBottom: "10px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px", background: "#f8fafc", padding: "16px", borderRadius: "12px", border: "1px solid #f1f5f9" }}>
                              <div>
                                <h4 style={{ margin: "0 0 6px 0", color: "#0f172a", fontSize: "16px", fontWeight: "600" }}>{log.action}</h4>
                                <p style={{ margin: 0, color: "#475569", fontSize: "14px", lineHeight: "1.5" }}>{log.details}</p>
                              </div>
                              <div style={{ textAlign: "right", minWidth: "120px" }}>
                                <span style={{ display: "block", color: "#64748b", fontSize: "13px", fontWeight: "600", marginBottom: "2px" }}>{log.date}</span>
                                <span style={{ color: "#94a3b8", fontSize: "12px", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "4px" }}>
                                  <FiClock size={10} /> {log.time}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    
                    {activities
                      .filter(log => log.email === currentUser.email && log.action !== "Draft Record Deleted" && log.date === new Date(activitySearchDate).toLocaleDateString()).length === 0 && (
                      <div style={{ textAlign: "center", padding: "60px 20px", color: "#94a3b8", display: "flex", flexDirection: "column", alignItems: "center", gap: "15px" }}>
                        <FiActivity size={48} color="#cbd5e1" />
                        <p style={{ fontSize: "16px", margin: 0 }}>No activities found for this date.</p>
                      </div>
                    )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "deedTypes" && (
            <div className="tab-view">
              <h2 style={{ marginTop: 0 }}>Deed Templates</h2>
              <div className="deed-grid">
                {Object.keys(templates).map((t) => (
                  <div key={t} className={`deed-tile ${selectedDeed === t ? "active" : ""}`} onClick={() => handleSelectDeed(t)}>
                    {t}
                  </div>
                ))}
              </div>
              <object data={templates[selectedDeed]} type="application/pdf" width="100%" height="600px" style={{ border: 'none', borderRadius: '8px', minHeight: '600px', backgroundColor: '#f1f5f9' }}>
                 <p style={{ textAlign: 'center', padding: '40px' }}>
                   Unable to display PDF inline. <a href={templates[selectedDeed]} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', fontWeight: 'bold' }}>Click here to view or download it directly.</a>
                 </p>
              </object>
            </div>
          )}
          
          {activeTab === "draftCreation" && (
            <div className="form-container" style={{ padding: "40px", background: "#f8fafc", minHeight: "100%" }}>
              
              {!draftLanguage ? (
                <div style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center", paddingTop: "50px" }}>
                  <h2 style={{ fontSize: "28px", color: "#0f172a", marginBottom: "10px" }}>Select Draft Language</h2>
                  <p style={{ color: "#64748b", marginBottom: "40px" }}>Choose the language for preparing and generating the legal deed.</p>
                  
                  <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", justifyContent: "center" }}>
                    <button className="language-btn" onClick={() => { setDraftLanguage("ta"); setCurrentStep(0); setPreviewDraft(null); }}>
                      <span style={{ fontSize: "40px" }}>தமிழ்</span>
                      Tamil Draft Creation
                    </button>
                    
                    <button className="language-btn" onClick={() => { setDraftLanguage("en"); setCurrentStep(0); setPreviewDraft(null); }}>
                      <span style={{ fontSize: "40px" }}>EN</span>
                      English Draft Creation
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="back-link" onClick={() => { setDraftLanguage(null); setPreviewDraft(null); }}>
                    <FiArrowLeft /> Back to Language Selection
                  </div>

                  <h2 style={{ marginTop: 0, marginBottom: "25px", color: "#0f172a" }}>
                    {draftLanguage === 'ta' ? 'Tamil' : 'English'} {draftForm.id ? "Edit & Resubmit Draft" : "Draft Creation"} - {draftForm.deedType}
                  </h2>

                  {!previewDraft && (
                    <div className="wizard-progress">
                      {formSections.map((_, idx) => (
                        <div key={idx} className={`wizard-step-dot ${idx === currentStep ? 'active' : ''} ${idx < currentStep ? 'completed' : ''}`} />
                      ))}
                    </div>
                  )}

                  {!previewDraft ? (
                    <div className="form-sections-container">
                      <div className="form-card-section">
                        <h3 className="section-title">Step {currentStep + 1} of 5: {formSections[currentStep].title}</h3>
                        <div className="grid-form">
                          {formSections[currentStep].fields.map(f => (
                            <div key={f.name} className="input-group">
                              <label>{f.label}:</label>
                              
                              {f.type === "select" ? (
                                <select 
                                  name={f.name} 
                                  value={draftForm[f.name] || ""} 
                                  onChange={handleDraftChange} 
                                  className={formErrors[f.name] ? "input-error" : ""}
                                >
                                  <option value="" disabled>-- Select --</option>
                                  {(f.dynamicOptions ? f.dynamicOptions(draftForm) : f.options).map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                  ))}
                                </select>
                              ) : f.type === "datalist" ? (
                                <>
                                  {draftLanguage === 'en' || f.isEnglishOnly ? (
                                    <input 
                                      list={`${f.name}-list`}
                                      type="text" 
                                      name={f.name} 
                                      value={draftForm[f.name]} 
                                      onChange={handleDraftChange} 
                                      className={formErrors[f.name] ? "input-error" : ""}
                                      autoComplete="off"
                                    />
                                  ) : (
                                    <SmartTamilInput
                                      list={`${f.name}-list`}
                                      value={draftForm[f.name]}
                                      name={f.name}
                                      onChangeText={(text) => {
                                        setDraftForm({ ...draftForm, [f.name]: text });
                                        if(formErrors[f.name]) setFormErrors({...formErrors, [f.name]: null});
                                      }}
                                      className={formErrors[f.name] ? "input-error" : ""}
                                    />
                                  )}
                                  <datalist id={`${f.name}-list`}>
                                    {(f.dynamicOptions ? f.dynamicOptions(draftForm) : f.options).map(opt => (
                                      <option key={opt} value={opt} />
                                    ))}
                                  </datalist>
                                </>
                              ) : f.type === "date" || f.type === "number" || f.isEnglishOnly || draftLanguage === 'en' ? (
                                <input 
                                  type={f.type || "text"} 
                                  name={f.name} 
                                  value={draftForm[f.name]} 
                                  onChange={handleDraftChange} 
                                  className={formErrors[f.name] ? "input-error" : ""}
                                />
                              ) : (
                                <SmartTamilInput
                                  value={draftForm[f.name]}
                                  name={f.name}
                                  onChangeText={(text) => {
                                    setDraftForm({ ...draftForm, [f.name]: text });
                                    if(formErrors[f.name]) setFormErrors({...formErrors, [f.name]: null});
                                  }}
                                  className={formErrors[f.name] ? "input-error" : ""}
                                />
                              )}

                              {formErrors[f.name] && <span className="error-text">{formErrors[f.name]}</span>}
                            </div>
                          ))}
                        </div>

                        {currentStep === 4 && (
                          <div className="input-group priority-checkbox" style={{ marginTop: '20px' }}>
                            <input type="checkbox" id="importantCheck" checked={draftForm.isImportant || false} onChange={(e) => setDraftForm({...draftForm, isImportant: e.target.checked})} />
                            <label htmlFor="importantCheck">
                              <FiAlertCircle size={20} /> Mark this draft as Important / High Priority
                            </label>
                          </div>
                        )}
                      </div>

                      <div className="wizard-actions">
                        {currentStep > 0 && (
                          <button onClick={handlePrevStep} className="btn-back">
                            <FiArrowLeft /> Back
                          </button>
                        )}
                        
                        {currentStep < 4 ? (
                          <button onClick={handleNextStep} className="btn-next">
                            Next Step <FiArrowRight />
                          </button>
                        ) : (
                          <button onClick={handlePrepareDraft} className="btn-next" style={{ background: '#10b981' }}>
                            <FiEye /> Preview Draft PDF
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="preview-box" style={{ padding: 0, background: "transparent", border: "none" }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: "15px" }}>
                        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                          PDF Preview generated ({draftLanguage === 'en' ? 'English' : 'Tamil'})
                          {previewDraft.isImportant && <span style={{ background: '#ef4444', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}><FiAlertCircle /> IMPORTANT</span>}
                        </h3>
                        <button onClick={() => setPreviewDraft(null)} className="btn-back" style={{ padding: '8px 16px', fontSize: '14px' }}>
                           <FiEdit3 /> Edit Info
                        </button>
                      </div>
                      
                      {generateDeedPreviewText(previewDraft)}
                      
                      <br />
                      <button 
                        onClick={() => handleSubmitDraft(previewDraft)} 
                        disabled={isGeneratingPdf}
                        className="submit-btn" 
                        style={{ padding: "15px 30px", fontSize: "16px", width: "100%", justifyContent: "center", opacity: isGeneratingPdf ? 0.7 : 1, marginTop: '20px' }}
                      >
                        {isGeneratingPdf ? "Generating PDF and Submitting..." : <><FiCheck /> Confirm & Submit PDF for Verification</>}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === "statusTracking" && (
            <div className="tracking-section">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: 0 }}>
                <FiCheckCircle color="#3b82f6" /> Active Document Status
              </h2>
              {drafts.filter(d => !d.staffRead).length === 0 ? <p className="empty-msg">No active documents to track right now.</p> :
                drafts.filter(d => !d.staffRead).map(d => renderTrackingCardStepped(d))
              }
            </div>
          )}

          {activeTab === "viewAllTracking" && (
            <div className="tracking-section">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px", flexWrap: "wrap", gap: "15px" }}>
                <h2 style={{ margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
                  <FiLayers /> All Document History
                </h2>
                
                <div 
                  style={{ display: "flex", alignItems: "center", gap: "10px", background: "white", padding: "10px 18px", borderRadius: "12px", border: "1px solid #cbd5e1", boxShadow: "0 2px 5px rgba(0,0,0,0.02)", transition: "all 0.2s" }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = '#cbd5e1'}
                >
                  <FiSearch color="#64748b" />
                  <span style={{ color: "#64748b", fontSize: "14px", fontWeight: "600" }}>Search:</span>
                  <input 
                    type="date" 
                    value={viewAllSearchDate}
                    onChange={(e) => setViewAllSearchDate(e.target.value)}
                    style={{ border: "none", outline: "none", background: "transparent", color: "#0f172a", fontWeight: "700", fontSize: "14px", padding: 0, margin: 0, width: "auto", cursor: "pointer", fontFamily: "inherit" }}
                  />
                  {viewAllSearchDate && (
                    <button onClick={() => setViewAllSearchDate("")} style={{ background: "#fee2e2", border: "1px solid #fecaca", color: "#ef4444", fontWeight: "bold", cursor: "pointer", padding: "4px 10px", borderRadius: "6px", fontSize: "12px", marginLeft: "10px" }}>Clear</button>
                  )}
                </div>
              </div>

              {filteredViewAllDrafts.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 20px", color: "#94a3b8", background: "white", borderRadius: "16px", border: "1px dashed #cbd5e1" }}>
                  <FiLayers size={48} color="#e2e8f0" />
                  <p className="empty-msg" style={{ marginTop: "15px" }}>No documents found for this criteria.</p>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr 1.5fr 1fr', padding: '0 20px 15px 20px', color: '#64748b', fontWeight: 'bold', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '2px solid #e2e8f0', marginBottom: '15px' }}>
                    <div>Date & Time</div>
                    <div>Drafts</div>
                    <div>Approved/Rejected</div>
                    <div style={{ textAlign: 'right' }}>Actions</div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {filteredViewAllDrafts.map(d => (
                      <div 
                        key={d.id} 
                        style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr 1.5fr 1fr', alignItems: 'center', background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 6px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', transition: 'all 0.2s' }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 15px rgba(0,0,0,0.06)'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.03)'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                      >
                        
                        <div>
                          <div style={{ color: '#0f172a', fontWeight: 'bold', fontSize: '15px' }}>{d.submittedOn?.date}</div>
                          <div style={{ color: '#64748b', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '6px' }}>
                            <FiClock size={14} /> {d.submittedOn?.time}
                          </div>
                        </div>

                        <div>
                          <div style={{ color: '#3b82f6', fontWeight: 'bold', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FiFileText size={18} /> {d.deedType}
                          </div>
                          <div style={{ color: '#475569', fontSize: '14px', marginTop: '6px' }}>
                            Client: <span style={{ fontWeight: 'bold', color: '#0f172a' }}>{d.clientName}</span>
                          </div>
                          {d.isImportant && (
                            <div style={{ marginTop: '8px' }}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#fee2e2', color: '#ef4444', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>
                                <FiAlertCircle size={12} /> IMPORTANT
                              </span>
                            </div>
                          )}
                        </div>

                        <div>
                          {renderStatusBadge(d.status, d.reason)}
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <button 
                            onClick={() => handleDeleteDraftRecord(d.id)} 
                            style={{ padding: '8px 16px', background: 'white', color: '#ef4444', border: '1px solid #fecaca', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', transition: 'all 0.2s' }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = '#fee2e2'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; }}
                          >
                            <FiTrash2 size={16} /> Delete Record
                          </button>
                        </div>

                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="notifications-tab" style={{ maxWidth: "900px" }}>
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px", flexWrap: "wrap", gap: "15px" }}>
                <h2 style={{ margin: 0, display: "flex", alignItems: "center", gap: "10px", color: showDeletedNotifs ? "#64748b" : "#0f172a" }}>
                  {showDeletedNotifs ? <><FiTrash2 /> Deleted Notifications</> : <><FiBell /> My Notifications</>}
                </h2>
                
                <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
                  <button 
                    onClick={() => setShowDeletedNotifs(!showDeletedNotifs)}
                    style={{ display: "flex", alignItems: "center", gap: "8px", background: showDeletedNotifs ? "#eff6ff" : "#fee2e2", color: showDeletedNotifs ? "#3b82f6" : "#ef4444", border: `1px solid ${showDeletedNotifs ? "#bfdbfe" : "#fecaca"}`, padding: "10px 16px", borderRadius: "12px", fontWeight: "bold", cursor: "pointer", transition: "all 0.2s" }}
                  >
                    {showDeletedNotifs ? <><FiInbox /> View Inbox</> : <><FiTrash2 /> View Trash</>}
                  </button>

                  <div 
                    style={{ display: "flex", alignItems: "center", gap: "10px", background: "white", padding: "10px 18px", borderRadius: "12px", border: "1px solid #cbd5e1", boxShadow: "0 2px 5px rgba(0,0,0,0.02)", transition: "all 0.2s" }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = '#cbd5e1'}
                  >
                    <FiSearch color="#64748b" />
                    <input 
                      type="date" 
                      value={notifSearchDate}
                      onChange={(e) => setNotifSearchDate(e.target.value)}
                      style={{ border: "none", outline: "none", background: "transparent", color: "#0f172a", fontWeight: "700", fontSize: "14px", padding: 0, margin: 0, width: "auto", cursor: "pointer", fontFamily: "inherit" }}
                    />
                    {notifSearchDate && (
                      <button onClick={() => setNotifSearchDate("")} style={{ background: "#f1f5f9", border: "none", color: "#64748b", fontWeight: "bold", cursor: "pointer", padding: "4px 8px", borderRadius: "6px", fontSize: "12px", marginLeft: "10px" }}>Clear</button>
                    )}
                  </div>
                </div>
              </div>

              {displayedNotifications.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 20px", color: "#94a3b8", background: "white", borderRadius: "16px", border: "1px dashed #cbd5e1" }}>
                  {showDeletedNotifs ? <FiTrash2 size={48} color="#e2e8f0" /> : <FiBell size={48} color="#e2e8f0" />}
                  <p style={{ fontSize: "16px", margin: "15px 0 0 0" }}>
                    {showDeletedNotifs ? "Your trash is empty." : "You have no notifications for this date."}
                  </p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                  {displayedNotifications.map(n => {
                    const uiStyle = getNotificationStyle(n.message, n.status);
                    
                    return (
                      <div 
                        key={n.id} 
                        onClick={() => !showDeletedNotifs && markAsRead(n.id)}
                        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: uiStyle.bg, borderLeft: uiStyle.borderLeft, borderTop: "1px solid #e2e8f0", borderRight: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0", padding: "16px 20px", borderRadius: "0 12px 12px 0", cursor: showDeletedNotifs ? "default" : "pointer", transition: "all 0.2s", opacity: (n.status === "read" && !showDeletedNotifs) ? 0.7 : 1 }}
                      >
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "15px" }}>
                          <div style={{ marginTop: "2px" }}>{uiStyle.icon}</div>
                          <div>
                            <p style={{ margin: "0 0 5px 0", color: "#0f172a", fontSize: "15px", fontWeight: n.status === "unread" ? "bold" : "500" }}>{n.message}</p>
                            <small style={{ color: "#64748b", fontSize: "12px", display: "flex", alignItems: "center", gap: "5px" }}>
                              <FiClock size={12} /> {n.date} {n.time && `| ${n.time}`}
                            </small>
                          </div>
                        </div>

                        <div style={{ marginLeft: "15px" }}>
                          {showDeletedNotifs ? (
                            <div style={{ display: "flex", gap: "10px" }}>
                              <button onClick={(e) => { e.stopPropagation(); restoreNotification(n.id); }} style={{ display: "flex", alignItems: "center", gap: "5px", background: "#dcfce7", color: "#16a34a", border: "1px solid #bbf7d0", padding: "6px 12px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", fontSize: "13px" }}>
                                <FiRotateCcw /> Restore
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); deleteNotificationPermanently(n.id); }} style={{ display: "flex", alignItems: "center", gap: "5px", background: "#fee2e2", color: "#ef4444", border: "1px solid #fecaca", padding: "6px 12px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", fontSize: "13px" }}>
                                <FiTrash2 /> Delete
                              </button>
                            </div>
                          ) : (
                            <button onClick={(e) => { e.stopPropagation(); moveToTrashNotification(n.id); }} style={{ display: "flex", alignItems: "center", gap: "5px", background: "white", color: "#64748b", border: "1px solid #cbd5e1", padding: "6px 12px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", fontSize: "13px", transition: "all 0.2s" }}
                              onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = '#fca5a5'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                            >
                              <FiTrash2 /> Remove
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === "clientCreation" && (
            <div className="client-section" style={{ background: "#f8fafc", padding: "40px", borderRadius: "16px", minHeight: "100%" }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '35px', flexWrap: 'wrap', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', padding: '14px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(16, 185, 129, 0.2)' }}>
                    <FiUsers size={26} />
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '26px', color: '#0f172a', fontWeight: '800' }}>Client Management</h2>
                    <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '15px' }}>Manage and register your clients securely.</p>
                  </div>
                </div>
                
                <div style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '10px 20px', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }}>
                  <div style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%' }}></div>
                  Total Clients: {clients.length}
                </div>
              </div>

              <div style={{ background: "white", padding: "25px", borderRadius: "16px", border: "1px solid #f1f5f9", boxShadow: "0 10px 25px rgba(0,0,0,0.03)", marginBottom: "40px" }}>
                <h3 style={{ margin: "0 0 20px 0", color: "#334155", fontSize: "16px", fontWeight: "700" }}>Register New Client</h3>
                <div style={{ display: "flex", gap: "15px", flexWrap: "wrap", alignItems: "center" }}>
                  <div style={{ flex: 1, minWidth: "220px", display: "flex", alignItems: "center", background: "#f8fafc", padding: "14px 18px", borderRadius: "10px", border: "1px solid #e2e8f0", transition: "all 0.3s" }} onFocus={(e) => {e.currentTarget.style.borderColor = "#10b981"; e.currentTarget.style.background = "white"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(16, 185, 129, 0.1)"}} onBlur={(e) => {e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.boxShadow = "none"}}>
                    <FiUsers color="#94a3b8" style={{ marginRight: "12px" }} size={20} />
                    <input 
                      autoComplete="off"
                      placeholder="Client Full Name" 
                      value={clientForm.name} 
                      onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })} 
                      style={{ border: "none", outline: "none", boxShadow: "none", padding: 0, margin: 0, background: "transparent", width: "100%", color: "#0f172a", fontSize: "15px", fontWeight: "500", fontFamily: "inherit" }} 
                    />
                  </div>
                  
                  <div style={{ flex: 1, minWidth: "220px", display: "flex", alignItems: "center", background: "#f8fafc", padding: "14px 18px", borderRadius: "10px", border: "1px solid #e2e8f0", transition: "all 0.3s" }} onFocus={(e) => {e.currentTarget.style.borderColor = "#10b981"; e.currentTarget.style.background = "white"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(16, 185, 129, 0.1)"}} onBlur={(e) => {e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.boxShadow = "none"}}>
                    <FiPhone color="#94a3b8" style={{ marginRight: "12px" }} size={20} />
                    <input 
                      autoComplete="off"
                      placeholder="Mobile Number" 
                      value={clientForm.phone} 
                      onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })} 
                      style={{ border: "none", outline: "none", boxShadow: "none", padding: 0, margin: 0, background: "transparent", width: "100%", color: "#0f172a", fontSize: "15px", fontWeight: "500", fontFamily: "inherit" }} 
                    />
                  </div>

                  <button 
                    onClick={handleAddClient} 
                    style={{ background: "#10b981", color: "white", border: "none", padding: "15px 28px", borderRadius: "10px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", transition: "all 0.2s", fontSize: "15px", whiteSpace: "nowrap", boxShadow: "0 4px 6px rgba(16, 185, 129, 0.25)" }} 
                    onMouseEnter={e => {e.currentTarget.style.background = "#059669"; e.currentTarget.style.transform = "translateY(-1px)"}} 
                    onMouseLeave={e => {e.currentTarget.style.background = "#10b981"; e.currentTarget.style.transform = "translateY(0)"}}
                    onMouseDown={e => e.currentTarget.style.transform = "translateY(1px)"}
                  >
                    <FiPlus size={20} /> Add Client
                  </button>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "15px" }}>
                <h3 style={{ margin: 0, color: "#334155", fontSize: "18px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
                  Existing Clients
                </h3>

                <div style={{ display: "flex", alignItems: "center", background: "white", padding: "10px 16px", borderRadius: "12px", border: "1px solid #cbd5e1", boxShadow: "0 2px 5px rgba(0,0,0,0.02)", width: "300px", maxWidth: "100%", transition: "all 0.2s" }} onFocus={(e) => e.currentTarget.style.borderColor = '#10b981'} onBlur={(e) => e.currentTarget.style.borderColor = '#cbd5e1'}>
                  <FiSearch color="#64748b" size={18} style={{ marginRight: "10px" }} />
                  <input 
                    type="text"
                    autoComplete="off"
                    placeholder="Search by name or phone..."
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                    style={{ border: "none", outline: "none", boxShadow: "none", padding: 0, margin: 0, background: "transparent", color: "#0f172a", fontSize: "14px", width: "100%", fontFamily: "inherit" }}
                  />
                  {clientSearch && (
                    <FiXCircle 
                      color="#94a3b8" 
                      size={18} 
                      style={{ cursor: "pointer", marginLeft: "5px" }} 
                      onClick={() => setClientSearch("")} 
                    />
                  )}
                </div>
              </div>
              
              {clients.length === 0 ? (
                <div style={{ textAlign: "center", padding: "80px 20px", color: "#94a3b8", background: "white", borderRadius: "16px", border: "2px dashed #e2e8f0" }}>
                  <div style={{ background: "#f1f5f9", width: "80px", height: "80px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px auto" }}>
                    <FiUsers size={36} color="#cbd5e1" />
                  </div>
                  <h4 style={{ margin: "0 0 8px 0", color: "#475569", fontSize: "18px" }}>No Clients Found</h4>
                  <p style={{ margin: 0, fontSize: "15px" }}>Use the form above to register your first client.</p>
                </div>
              ) : filteredClients.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 20px", color: "#94a3b8", background: "white", borderRadius: "16px", border: "1px dashed #e2e8f0" }}>
                  <FiSearch size={36} color="#cbd5e1" style={{ marginBottom: "10px" }} />
                  <h4 style={{ margin: "0 0 8px 0", color: "#475569", fontSize: "16px" }}>No matches found</h4>
                  <p style={{ margin: 0, fontSize: "14px" }}>We couldn't find any clients matching "{clientSearch}".</p>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "15px" }}>
                  {filteredClients.map((c, i) => (
                    <div 
                      key={i} 
                      style={{ background: "white", padding: "12px 16px", borderRadius: "12px", border: "1px solid #f1f5f9", boxShadow: "0 2px 5px rgba(0,0,0,0.02)", display: "flex", alignItems: "center", gap: "12px", transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)", cursor: "default" }} 
                      onMouseEnter={e => {e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.04)'; e.currentTarget.style.borderColor = '#a7f3d0'}} 
                      onMouseLeave={e => {e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 5px rgba(0,0,0,0.02)'; e.currentTarget.style.borderColor = '#f1f5f9'}}
                    >
                      <div style={{ width: "40px", height: "40px", minWidth: "40px", borderRadius: "10px", background: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)", color: "#047857", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: "800", boxShadow: "inset 0 2px 4px rgba(255,255,255,0.5)" }}>
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ overflow: "hidden" }}>
                        <h3 style={{ margin: "0 0 2px 0", color: "#0f172a", fontSize: "15px", fontWeight: "700", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {c.name}
                        </h3>
                        <p style={{ margin: 0, color: "#64748b", fontSize: "13px" }}>
                          {c.phone} 
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* --- NOTIFICATION ALERTS & CONFIRMS --- */}
      {modal.show && (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 10000, backdropFilter: 'blur(4px)', padding: '20px'
        }}>
            <div style={{
                background: 'white', padding: '30px', borderRadius: '20px',
                width: '100%', maxWidth: '420px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                animation: 'modalSlideIn 0.3s ease'
            }}>
                <h3 style={{ marginTop: 0, color: '#0f172a', fontSize: '20px' }}>{modal.title}</h3>
                <p style={{ color: '#64748b', lineHeight: '1.6', fontSize: '15px' }}>{modal.message}</p>
                
                {modal.type === "prompt" && (
                    <input 
                        autoFocus
                        style={{ width: '100%', padding: '12px 15px', borderRadius: '10px', border: '2px solid #e2e8f0', marginTop: '15px', boxSizing: 'border-box', outline: 'none', fontSize: '16px' }}
                        value={modal.inputValue}
                        onChange={(e) => setModal({...modal, inputValue: e.target.value})}
                        onKeyPress={(e) => e.key === 'Enter' && modal.onConfirm(modal.inputValue)}
                    />
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '30px' }}>
                    {(modal.type === "confirm" || modal.type === "prompt") && (
                        <button 
                            onClick={() => setModal({ ...modal, show: false })}
                            style={{ padding: '10px 20px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontWeight: '600', color: '#64748b' }}
                        >
                            Cancel
                        </button>
                    )}
                    <button 
                        onClick={() => {
                            if (modal.onConfirm) {
                                modal.type === "prompt" ? modal.onConfirm(modal.inputValue) : modal.onConfirm();
                            }
                            setModal({ ...modal, show: false });
                        }}
                        style={{ padding: '10px 24px', borderRadius: '10px', border: 'none', background: '#4f46e5', color: 'white', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.4)' }}
                    >
                        {modal.type === "alert" ? "OK" : "Confirm"}
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* --- PDF VIEWER MODAL --- */}
      {pdfViewer.show && (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            backgroundColor: 'rgba(15, 23, 42, 0.8)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 10000, backdropFilter: 'blur(4px)', 
            padding: pdfViewer.fullScreen ? '0' : '20px'
        }}>
            <div style={{
                background: '#e2e8f0', padding: pdfViewer.fullScreen ? '0' : '20px', 
                borderRadius: pdfViewer.fullScreen ? '0' : '16px',
                width: '100%', maxWidth: pdfViewer.fullScreen ? '100%' : '900px', 
                height: pdfViewer.fullScreen ? '100vh' : '90vh', 
                display: 'flex', flexDirection: 'column',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', transition: 'all 0.3s ease'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: pdfViewer.fullScreen ? '0' : '15px', background: 'white', padding: '15px 20px', borderRadius: pdfViewer.fullScreen ? '0' : '10px' }}>
                    <h3 style={{ margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <FiFileText color="#3b82f6" /> 
                      {pdfViewer.draft?.deedType} - {pdfViewer.draft?.clientName}
                    </h3>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button 
                            onClick={() => setPdfViewer({...pdfViewer, fullScreen: !pdfViewer.fullScreen})}
                            style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#334155', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                            {pdfViewer.fullScreen ? <><FiMinimize /> Exit Fullscreen</> : <><FiMaximize /> Fullscreen</>}
                        </button>
                        <button 
                            onClick={() => handleDownloadPdf(pdfViewer.draft)}
                            style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#10b981', color: 'white', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                            <FiDownload /> Download
                        </button>
                        <button 
                            onClick={() => setPdfViewer({ show: false, pdfBase64: null, draft: null, fullScreen: false })}
                            style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                            <FiXCircle /> Close
                        </button>
                    </div>
                </div>
                
                <div style={{ flex: 1, background: 'white', borderRadius: pdfViewer.fullScreen ? '0' : '10px', overflow: 'hidden' }}>
                  <iframe 
                    src={pdfViewer.pdfBase64} 
                    title="PDF Preview" 
                    width="100%" 
                    height="100%" 
                    style={{ border: 'none' }}
                  />
                </div>
            </div>
        </div>
      )}
      
    </div>
  );
}