// Langues dans lesquelles un e-book peut être rédigé : les mêmes que celles du site.
// Pour chacune : le nom donné à Gemini, la mention IA (règle Etsy), les avertissements des sujets sensibles et les mots de la miniature.

export interface ContentLang {
  fr: string; // nom en français, utilisé dans les consignes envoyées à Gemini
  ai: string;
  health: string;
  finance: string;
  legal: string;
  thumb: { kicker: string; chap: string; pages: string; pdf: string; toc: string };
}

export const CONTENT_LANGS: Record<string, ContentLang> = {
  fr: {
    fr: "français",
    ai: "Ce guide a été rédigé avec l'aide d'outils d'intelligence artificielle, puis relu et édité par l'auteur.",
    health: "Ce guide a une vocation informative et éducative. Il ne remplace en aucun cas l'avis, le diagnostic ou le traitement d'un médecin, d'un diététicien ou de tout autre professionnel de santé. Consultez un professionnel avant de commencer un programme d'exercice ou de modifier votre alimentation, en particulier si vous êtes enceinte, si vous avez des problèmes de santé ou si vous prenez un traitement. Les résultats varient d'une personne à l'autre et ne sont pas garantis.",
    finance: "Ce guide a une vocation informative et éducative et ne constitue pas un conseil financier, fiscal ou en investissement personnalisé. Tout investissement comporte un risque de perte en capital. Les performances passées ne préjugent pas des performances futures. Aucun revenu ni gain n'est garanti. Renseignez-vous et, si besoin, consultez un professionnel agréé avant toute décision.",
    legal: "Ce guide a une vocation informative et ne constitue pas un conseil juridique. Les règles évoluent et dépendent de votre situation et de votre pays : vérifiez les informations auprès des sources officielles ou d'un professionnel du droit.",
    thumb: { kicker: "Le guide complet", chap: "chapitres", pages: "pages", pdf: "PDF à télécharger", toc: "Au sommaire" },
  },
  en: {
    fr: "anglais",
    ai: "This guide was written with the help of artificial intelligence tools, then reviewed and edited by the author.",
    health: "This guide is for informational and educational purposes only. It does not replace the advice, diagnosis or treatment of a doctor, dietitian or other health professional. Consult a professional before starting an exercise program or changing your diet, especially if you are pregnant, have a health condition or take medication. Results vary and are not guaranteed.",
    finance: "This guide is for informational and educational purposes only and is not personalised financial, tax or investment advice. All investments carry a risk of capital loss. Past performance does not guarantee future results. No income or gain is guaranteed. Do your own research and consult a licensed professional before making decisions.",
    legal: "This guide is for informational purposes only and is not legal advice. Rules change and depend on your situation and country: check official sources or consult a legal professional.",
    thumb: { kicker: "The complete guide", chap: "chapters", pages: "pages", pdf: "Instant PDF download", toc: "Inside" },
  },
  de: {
    fr: "allemand",
    ai: "Dieser Ratgeber wurde mit Hilfe von KI-Werkzeugen verfasst und anschließend vom Autor überprüft und bearbeitet.",
    health: "Dieser Ratgeber dient ausschließlich der Information und Bildung. Er ersetzt nicht den Rat, die Diagnose oder die Behandlung durch einen Arzt, Ernährungsberater oder andere Fachleute. Sprich vor Beginn eines Trainingsprogramms oder einer Ernährungsumstellung mit einer Fachperson, besonders bei Schwangerschaft, Erkrankungen oder Medikamenteneinnahme. Ergebnisse sind individuell und nicht garantiert.",
    finance: "Dieser Ratgeber dient ausschließlich der Information und Bildung und stellt keine persönliche Finanz-, Steuer- oder Anlageberatung dar. Jede Geldanlage birgt das Risiko eines Kapitalverlusts. Frühere Wertentwicklungen sind kein Indikator für künftige Ergebnisse. Einkommen oder Gewinne sind nicht garantiert. Informiere dich selbst und ziehe bei Bedarf eine zugelassene Fachperson hinzu.",
    legal: "Dieser Ratgeber dient ausschließlich der Information und stellt keine Rechtsberatung dar. Regeln ändern sich und hängen von deiner Situation und deinem Land ab: Prüfe die Angaben bei offiziellen Stellen oder einer Rechtsfachperson.",
    thumb: { kicker: "Der komplette Leitfaden", chap: "Kapitel", pages: "Seiten", pdf: "PDF zum Download", toc: "Inhalt" },
  },
  es: {
    fr: "espagnol",
    ai: "Esta guía fue redactada con la ayuda de herramientas de inteligencia artificial y luego revisada y editada por el autor.",
    health: "Esta guía tiene fines exclusivamente informativos y educativos. No sustituye el consejo, el diagnóstico ni el tratamiento de un médico, dietista u otro profesional de la salud. Consulta a un profesional antes de empezar un programa de ejercicio o cambiar tu alimentación, sobre todo si estás embarazada, tienes problemas de salud o tomas medicación. Los resultados varían y no están garantizados.",
    finance: "Esta guía tiene fines exclusivamente informativos y educativos y no constituye asesoramiento financiero, fiscal ni de inversión personalizado. Toda inversión conlleva un riesgo de pérdida de capital. Las rentabilidades pasadas no garantizan resultados futuros. No se garantiza ningún ingreso ni ganancia. Infórmate y, si es necesario, consulta a un profesional autorizado.",
    legal: "Esta guía tiene fines exclusivamente informativos y no constituye asesoramiento jurídico. Las normas cambian y dependen de tu situación y de tu país: comprueba la información en fuentes oficiales o con un profesional del derecho.",
    thumb: { kicker: "La guía completa", chap: "capítulos", pages: "páginas", pdf: "PDF descargable", toc: "Contenido" },
  },
  it: {
    fr: "italien",
    ai: "Questa guida è stata scritta con l'aiuto di strumenti di intelligenza artificiale, poi rivista e modificata dall'autore.",
    health: "Questa guida ha scopo esclusivamente informativo ed educativo. Non sostituisce il parere, la diagnosi o la cura di un medico, di un dietista o di un altro professionista della salute. Consulta un professionista prima di iniziare un programma di allenamento o di cambiare alimentazione, soprattutto in gravidanza, in presenza di problemi di salute o se assumi farmaci. I risultati variano e non sono garantiti.",
    finance: "Questa guida ha scopo esclusivamente informativo ed educativo e non costituisce consulenza finanziaria, fiscale o di investimento personalizzata. Ogni investimento comporta un rischio di perdita del capitale. I rendimenti passati non garantiscono quelli futuri. Nessun reddito o guadagno è garantito. Informati e, se necessario, rivolgiti a un professionista abilitato.",
    legal: "Questa guida ha scopo esclusivamente informativo e non costituisce consulenza legale. Le regole cambiano e dipendono dalla tua situazione e dal tuo paese: verifica le informazioni presso fonti ufficiali o un professionista del diritto.",
    thumb: { kicker: "La guida completa", chap: "capitoli", pages: "pagine", pdf: "PDF scaricabile", toc: "Contenuti" },
  },
  pt: {
    fr: "portugais (européen)",
    ai: "Este guia foi escrito com a ajuda de ferramentas de inteligência artificial e depois revisto e editado pelo autor.",
    health: "Este guia tem fins exclusivamente informativos e educativos. Não substitui o aconselhamento, o diagnóstico ou o tratamento de um médico, nutricionista ou outro profissional de saúde. Consulta um profissional antes de iniciar um programa de exercício ou alterar a tua alimentação, sobretudo se estiveres grávida, tiveres problemas de saúde ou tomares medicação. Os resultados variam e não são garantidos.",
    finance: "Este guia tem fins exclusivamente informativos e educativos e não constitui aconselhamento financeiro, fiscal ou de investimento personalizado. Qualquer investimento implica risco de perda de capital. Os resultados passados não garantem resultados futuros. Nenhum rendimento ou ganho é garantido. Informa-te e, se necessário, consulta um profissional habilitado.",
    legal: "Este guia tem fins exclusivamente informativos e não constitui aconselhamento jurídico. As regras mudam e dependem da tua situação e do teu país: confirma a informação junto de fontes oficiais ou de um profissional do direito.",
    thumb: { kicker: "O guia completo", chap: "capítulos", pages: "páginas", pdf: "PDF para descarregar", toc: "Conteúdo" },
  },
  nl: {
    fr: "néerlandais",
    ai: "Deze gids is geschreven met behulp van tools voor kunstmatige intelligentie en daarna door de auteur nagelezen en bewerkt.",
    health: "Deze gids is uitsluitend bedoeld ter informatie en educatie. Hij vervangt niet het advies, de diagnose of de behandeling van een arts, diëtist of andere zorgprofessional. Raadpleeg een professional voordat je met een trainingsprogramma begint of je voeding aanpast, zeker als je zwanger bent, gezondheidsklachten hebt of medicijnen gebruikt. Resultaten verschillen per persoon en zijn niet gegarandeerd.",
    finance: "Deze gids is uitsluitend bedoeld ter informatie en educatie en is geen persoonlijk financieel, fiscaal of beleggingsadvies. Elke belegging brengt een risico op kapitaalverlies met zich mee. In het verleden behaalde resultaten bieden geen garantie voor de toekomst. Er wordt geen inkomen of winst gegarandeerd. Doe je eigen onderzoek en raadpleeg zo nodig een erkende professional.",
    legal: "Deze gids is uitsluitend bedoeld ter informatie en is geen juridisch advies. Regels veranderen en hangen af van je situatie en je land: controleer de informatie bij officiële bronnen of een juridisch professional.",
    thumb: { kicker: "De complete gids", chap: "hoofdstukken", pages: "pagina's", pdf: "Direct te downloaden pdf", toc: "Inhoud" },
  },
  pl: {
    fr: "polonais",
    ai: "Ten poradnik został napisany przy pomocy narzędzi sztucznej inteligencji, a następnie sprawdzony i zredagowany przez autora.",
    health: "Ten poradnik ma wyłącznie charakter informacyjny i edukacyjny. Nie zastępuje porady, diagnozy ani leczenia przez lekarza, dietetyka czy innego specjalistę. Przed rozpoczęciem programu ćwiczeń lub zmianą diety skonsultuj się ze specjalistą, zwłaszcza jeśli jesteś w ciąży, masz problemy zdrowotne lub przyjmujesz leki. Wyniki są indywidualne i nie są gwarantowane.",
    finance: "Ten poradnik ma wyłącznie charakter informacyjny i edukacyjny i nie stanowi indywidualnej porady finansowej, podatkowej ani inwestycyjnej. Każda inwestycja wiąże się z ryzykiem utraty kapitału. Wyniki osiągnięte w przeszłości nie gwarantują wyników w przyszłości. Żaden dochód ani zysk nie jest gwarantowany. Przed podjęciem decyzji zasięgnij informacji i w razie potrzeby skonsultuj się z licencjonowanym specjalistą.",
    legal: "Ten poradnik ma wyłącznie charakter informacyjny i nie stanowi porady prawnej. Przepisy się zmieniają i zależą od twojej sytuacji oraz kraju: sprawdź informacje w oficjalnych źródłach lub u prawnika.",
    thumb: { kicker: "Kompletny poradnik", chap: "rozdziałów", pages: "stron", pdf: "PDF do pobrania", toc: "W środku" },
  },
  ro: {
    fr: "roumain",
    ai: "Acest ghid a fost scris cu ajutorul unor instrumente de inteligență artificială, apoi revizuit și editat de autor.",
    health: "Acest ghid are un scop exclusiv informativ și educativ. Nu înlocuiește sfatul, diagnosticul sau tratamentul unui medic, nutriționist sau alt profesionist din domeniul sănătății. Consultă un specialist înainte de a începe un program de exerciții sau de a-ți schimba alimentația, mai ales dacă ești însărcinată, ai probleme de sănătate sau urmezi un tratament. Rezultatele variază și nu sunt garantate.",
    finance: "Acest ghid are un scop exclusiv informativ și educativ și nu constituie consultanță financiară, fiscală sau de investiții personalizată. Orice investiție implică riscul pierderii capitalului. Performanțele trecute nu garantează rezultatele viitoare. Niciun venit sau câștig nu este garantat. Informează-te și, dacă e nevoie, consultă un profesionist autorizat.",
    legal: "Acest ghid are un scop exclusiv informativ și nu constituie consultanță juridică. Regulile se schimbă și depind de situația și țara ta: verifică informațiile din surse oficiale sau cu un jurist.",
    thumb: { kicker: "Ghidul complet", chap: "capitole", pages: "pagini", pdf: "PDF descărcabil", toc: "Cuprins" },
  },
  cs: {
    fr: "tchèque",
    ai: "Tento průvodce byl napsán s pomocí nástrojů umělé inteligence a poté ho autor zkontroloval a upravil.",
    health: "Tento průvodce slouží pouze k informačním a vzdělávacím účelům. Nenahrazuje radu, diagnózu ani léčbu lékaře, nutričního terapeuta nebo jiného zdravotníka. Než začneš s cvičebním programem nebo změníš stravování, poraď se s odborníkem, zejména pokud jsi těhotná, máš zdravotní potíže nebo užíváš léky. Výsledky se liší a nejsou zaručeny.",
    finance: "Tento průvodce slouží pouze k informačním a vzdělávacím účelům a nepředstavuje individuální finanční, daňové ani investiční poradenství. Každá investice nese riziko ztráty kapitálu. Minulé výsledky nezaručují výsledky budoucí. Žádný příjem ani zisk není zaručen. Informuj se a v případě potřeby se poraď s licencovaným odborníkem.",
    legal: "Tento průvodce slouží pouze k informačním účelům a nepředstavuje právní poradenství. Pravidla se mění a závisí na tvé situaci a zemi: ověř si informace z oficiálních zdrojů nebo u právníka.",
    thumb: { kicker: "Kompletní průvodce", chap: "kapitol", pages: "stran", pdf: "PDF ke stažení", toc: "Obsah" },
  },
  sk: {
    fr: "slovaque",
    ai: "Tento sprievodca bol napísaný s pomocou nástrojov umelej inteligencie a potom ho autor skontroloval a upravil.",
    health: "Tento sprievodca slúži iba na informačné a vzdelávacie účely. Nenahrádza radu, diagnózu ani liečbu lekára, nutričného terapeuta či iného zdravotníka. Skôr ako začneš s cvičebným programom alebo zmeníš stravovanie, poraď sa s odborníkom, najmä ak si tehotná, máš zdravotné problémy alebo užívaš lieky. Výsledky sa líšia a nie sú zaručené.",
    finance: "Tento sprievodca slúži iba na informačné a vzdelávacie účely a nie je individuálnym finančným, daňovým ani investičným poradenstvom. Každá investícia nesie riziko straty kapitálu. Minulé výsledky nezaručujú budúce výsledky. Žiadny príjem ani zisk nie je zaručený. Informuj sa a v prípade potreby sa poraď s licencovaným odborníkom.",
    legal: "Tento sprievodca slúži iba na informačné účely a nie je právnym poradenstvom. Pravidlá sa menia a závisia od tvojej situácie a krajiny: over si informácie z oficiálnych zdrojov alebo u právnika.",
    thumb: { kicker: "Kompletný sprievodca", chap: "kapitol", pages: "strán", pdf: "PDF na stiahnutie", toc: "Obsah" },
  },
  hu: {
    fr: "hongrois",
    ai: "Ez az útmutató mesterséges intelligencia eszközök segítségével készült, majd a szerző átnézte és szerkesztette.",
    health: "Ez az útmutató kizárólag tájékoztató és oktatási célt szolgál. Nem helyettesíti orvos, dietetikus vagy más egészségügyi szakember tanácsát, diagnózisát vagy kezelését. Edzésprogram megkezdése vagy étrended megváltoztatása előtt konzultálj szakemberrel, különösen ha várandós vagy, egészségügyi problémád van vagy gyógyszert szedsz. Az eredmények egyénenként eltérnek, és nem garantáltak.",
    finance: "Ez az útmutató kizárólag tájékoztató és oktatási célt szolgál, és nem minősül személyre szabott pénzügyi, adózási vagy befektetési tanácsadásnak. Minden befektetés a tőke elvesztésének kockázatával jár. A múltbeli teljesítmény nem garantálja a jövőbeli eredményeket. Semmilyen jövedelem vagy nyereség nem garantált. Tájékozódj, és szükség esetén fordulj engedéllyel rendelkező szakemberhez.",
    legal: "Ez az útmutató kizárólag tájékoztató célt szolgál, és nem minősül jogi tanácsadásnak. A szabályok változnak, és a helyzetedtől és országodtól függenek: ellenőrizd az információkat hivatalos forrásokban vagy jogi szakembernél.",
    thumb: { kicker: "A teljes útmutató", chap: "fejezet", pages: "oldal", pdf: "Letölthető PDF", toc: "Tartalom" },
  },
  sv: {
    fr: "suédois",
    ai: "Den här guiden har skrivits med hjälp av verktyg för artificiell intelligens och sedan granskats och redigerats av författaren.",
    health: "Den här guiden är endast avsedd som information och utbildning. Den ersätter inte råd, diagnos eller behandling från läkare, dietist eller annan vårdpersonal. Rådfråga en expert innan du börjar ett träningsprogram eller ändrar din kost, särskilt om du är gravid, har hälsoproblem eller tar medicin. Resultaten varierar och kan inte garanteras.",
    finance: "Den här guiden är endast avsedd som information och utbildning och utgör inte personlig finansiell rådgivning, skatterådgivning eller investeringsrådgivning. Alla investeringar innebär en risk att förlora kapital. Historisk avkastning är ingen garanti för framtida avkastning. Ingen inkomst eller vinst garanteras. Gör din egen research och rådfråga vid behov en auktoriserad rådgivare.",
    legal: "Den här guiden är endast avsedd som information och utgör inte juridisk rådgivning. Regler ändras och beror på din situation och ditt land: kontrollera uppgifterna hos officiella källor eller en jurist.",
    thumb: { kicker: "Den kompletta guiden", chap: "kapitel", pages: "sidor", pdf: "Pdf att ladda ner direkt", toc: "Innehåll" },
  },
  da: {
    fr: "danois",
    ai: "Denne guide er skrevet ved hjælp af værktøjer til kunstig intelligens og derefter gennemlæst og redigeret af forfatteren.",
    health: "Denne guide er udelukkende til information og undervisning. Den erstatter ikke råd, diagnose eller behandling fra en læge, diætist eller anden sundhedsfaglig person. Tal med en fagperson, før du starter et træningsprogram eller ændrer din kost, især hvis du er gravid, har helbredsproblemer eller tager medicin. Resultaterne varierer og er ikke garanteret.",
    finance: "Denne guide er udelukkende til information og undervisning og udgør ikke personlig finansiel, skattemæssig eller investeringsmæssig rådgivning. Enhver investering indebærer risiko for tab af kapital. Tidligere afkast er ingen garanti for fremtidige resultater. Ingen indtægt eller gevinst er garanteret. Undersøg selv og kontakt om nødvendigt en autoriseret rådgiver.",
    legal: "Denne guide er udelukkende til information og udgør ikke juridisk rådgivning. Regler ændrer sig og afhænger af din situation og dit land: tjek oplysningerne hos officielle kilder eller en jurist.",
    thumb: { kicker: "Den komplette guide", chap: "kapitler", pages: "sider", pdf: "Pdf til download", toc: "Indhold" },
  },
  fi: {
    fr: "finnois",
    ai: "Tämä opas on kirjoitettu tekoälytyökalujen avulla, minkä jälkeen kirjoittaja on tarkistanut ja muokannut sen.",
    health: "Tämä opas on tarkoitettu vain tiedoksi ja opetuskäyttöön. Se ei korvaa lääkärin, ravitsemusterapeutin tai muun terveydenhuollon ammattilaisen neuvoja, diagnoosia tai hoitoa. Keskustele ammattilaisen kanssa ennen kuin aloitat liikuntaohjelman tai muutat ruokavaliotasi, etenkin jos olet raskaana, sinulla on terveysongelmia tai käytät lääkkeitä. Tulokset vaihtelevat eikä niitä voida taata.",
    finance: "Tämä opas on tarkoitettu vain tiedoksi ja opetuskäyttöön, eikä se ole henkilökohtaista talous-, vero- tai sijoitusneuvontaa. Kaikkiin sijoituksiin liittyy pääoman menettämisen riski. Aiempi tuotto ei takaa tulevaa. Mitään tuloja tai voittoja ei taata. Ota itse selvää ja käänny tarvittaessa luvanhaltijan asiantuntijan puoleen.",
    legal: "Tämä opas on tarkoitettu vain tiedoksi, eikä se ole oikeudellista neuvontaa. Säännöt muuttuvat ja riippuvat tilanteestasi ja maastasi: tarkista tiedot virallisista lähteistä tai lakimieheltä.",
    thumb: { kicker: "Täydellinen opas", chap: "lukua", pages: "sivua", pdf: "Ladattava PDF", toc: "Sisältö" },
  },
  el: {
    fr: "grec",
    ai: "Αυτός ο οδηγός γράφτηκε με τη βοήθεια εργαλείων τεχνητής νοημοσύνης και στη συνέχεια ελέγχθηκε και επιμελήθηκε από τον συγγραφέα.",
    health: "Αυτός ο οδηγός έχει αποκλειστικά ενημερωτικό και εκπαιδευτικό χαρακτήρα. Δεν αντικαθιστά τη συμβουλή, τη διάγνωση ή τη θεραπεία από γιατρό, διαιτολόγο ή άλλο επαγγελματία υγείας. Συμβουλέψου έναν ειδικό πριν ξεκινήσεις πρόγραμμα άσκησης ή αλλάξεις τη διατροφή σου, ιδιαίτερα αν είσαι έγκυος, έχεις προβλήματα υγείας ή παίρνεις φάρμακα. Τα αποτελέσματα διαφέρουν και δεν είναι εγγυημένα.",
    finance: "Αυτός ο οδηγός έχει αποκλειστικά ενημερωτικό και εκπαιδευτικό χαρακτήρα και δεν αποτελεί εξατομικευμένη χρηματοοικονομική, φορολογική ή επενδυτική συμβουλή. Κάθε επένδυση ενέχει κίνδυνο απώλειας κεφαλαίου. Οι προηγούμενες αποδόσεις δεν εγγυώνται μελλοντικά αποτελέσματα. Κανένα εισόδημα ή κέρδος δεν είναι εγγυημένο. Ενημερώσου και, αν χρειαστεί, συμβουλέψου αδειοδοτημένο επαγγελματία.",
    legal: "Αυτός ο οδηγός έχει αποκλειστικά ενημερωτικό χαρακτήρα και δεν αποτελεί νομική συμβουλή. Οι κανόνες αλλάζουν και εξαρτώνται από την κατάστασή σου και τη χώρα σου: έλεγξε τις πληροφορίες σε επίσημες πηγές ή με νομικό.",
    thumb: { kicker: "Ο πλήρης οδηγός", chap: "κεφάλαια", pages: "σελίδες", pdf: "PDF για λήψη", toc: "Περιεχόμενα" },
  },
  bg: {
    fr: "bulgare",
    ai: "Това ръководство е написано с помощта на инструменти с изкуствен интелект, след което е прегледано и редактирано от автора.",
    health: "Това ръководство е само с информационна и образователна цел. То не заменя съвета, диагнозата или лечението от лекар, диетолог или друг здравен специалист. Консултирай се със специалист, преди да започнеш тренировъчна програма или да промениш храненето си, особено ако си бременна, имаш здравословни проблеми или приемаш лекарства. Резултатите са различни и не са гарантирани.",
    finance: "Това ръководство е само с информационна и образователна цел и не представлява персонален финансов, данъчен или инвестиционен съвет. Всяка инвестиция носи риск от загуба на капитал. Миналите резултати не гарантират бъдещи. Никакъв доход или печалба не е гарантиран. Проучи сам и при нужда се консултирай с лицензиран специалист.",
    legal: "Това ръководство е само с информационна цел и не представлява правен съвет. Правилата се променят и зависят от твоята ситуация и държава: провери информацията в официални източници или при юрист.",
    thumb: { kicker: "Пълното ръководство", chap: "глави", pages: "страници", pdf: "PDF за изтегляне", toc: "Съдържание" },
  },
  hr: {
    fr: "croate",
    ai: "Ovaj vodič napisan je uz pomoć alata umjetne inteligencije, a zatim ga je autor pregledao i uredio.",
    health: "Ovaj vodič služi isključivo u informativne i edukativne svrhe. Ne zamjenjuje savjet, dijagnozu ni liječenje liječnika, nutricionista ili drugog zdravstvenog stručnjaka. Prije početka programa vježbanja ili promjene prehrane posavjetuj se sa stručnjakom, osobito ako si trudna, imaš zdravstvenih problema ili uzimaš lijekove. Rezultati se razlikuju i nisu zajamčeni.",
    finance: "Ovaj vodič služi isključivo u informativne i edukativne svrhe i ne predstavlja osobni financijski, porezni ni investicijski savjet. Svako ulaganje nosi rizik gubitka kapitala. Prošli rezultati ne jamče buduće. Nikakav prihod ni dobit nisu zajamčeni. Informiraj se i po potrebi posavjetuj s ovlaštenim stručnjakom.",
    legal: "Ovaj vodič služi isključivo u informativne svrhe i ne predstavlja pravni savjet. Pravila se mijenjaju i ovise o tvojoj situaciji i zemlji: provjeri informacije u službenim izvorima ili kod pravnika.",
    thumb: { kicker: "Cjeloviti vodič", chap: "poglavlja", pages: "stranica", pdf: "PDF za preuzimanje", toc: "Sadržaj" },
  },
  sl: {
    fr: "slovène",
    ai: "Ta vodnik je bil napisan s pomočjo orodij umetne inteligence, nato pa ga je avtor pregledal in uredil.",
    health: "Ta vodnik je namenjen zgolj informiranju in izobraževanju. Ne nadomešča nasveta, diagnoze ali zdravljenja zdravnika, dietetika ali drugega zdravstvenega strokovnjaka. Preden začneš z vadbo ali spremeniš prehrano, se posvetuj s strokovnjakom, še posebej če si noseča, imaš zdravstvene težave ali jemlješ zdravila. Rezultati se razlikujejo in niso zagotovljeni.",
    finance: "Ta vodnik je namenjen zgolj informiranju in izobraževanju in ne predstavlja osebnega finančnega, davčnega ali naložbenega svetovanja. Vsaka naložba nosi tveganje izgube kapitala. Pretekli donosi ne zagotavljajo prihodnjih. Noben prihodek ali dobiček ni zagotovljen. Pozanimaj se in se po potrebi posvetuj s pooblaščenim strokovnjakom.",
    legal: "Ta vodnik je namenjen zgolj informiranju in ne predstavlja pravnega svetovanja. Pravila se spreminjajo in so odvisna od tvojega položaja in države: preveri podatke pri uradnih virih ali pri pravniku.",
    thumb: { kicker: "Celoten vodnik", chap: "poglavij", pages: "strani", pdf: "PDF za prenos", toc: "Vsebina" },
  },
  et: {
    fr: "estonien",
    ai: "See juhend on kirjutatud tehisintellekti tööriistade abil ning seejärel autori poolt üle vaadatud ja toimetatud.",
    health: "See juhend on mõeldud ainult teavitamiseks ja õppimiseks. See ei asenda arsti, toitumisnõustaja ega muu tervishoiutöötaja nõuannet, diagnoosi ega ravi. Enne treeningkava alustamist või toitumise muutmist pea nõu spetsialistiga, eriti kui oled rase, sul on terviseprobleeme või võtad ravimeid. Tulemused on erinevad ega ole tagatud.",
    finance: "See juhend on mõeldud ainult teavitamiseks ja õppimiseks ega ole isiklik finants-, maksu- ega investeerimisnõustamine. Iga investeering kätkeb kapitali kaotamise riski. Varasem tootlus ei taga tulevast tulemust. Mingit tulu ega kasumit ei garanteerita. Uuri ise ja vajadusel pea nõu litsentseeritud spetsialistiga.",
    legal: "See juhend on mõeldud ainult teavitamiseks ega ole õigusabi. Reeglid muutuvad ja sõltuvad sinu olukorrast ja riigist: kontrolli teavet ametlikest allikatest või juristilt.",
    thumb: { kicker: "Täielik juhend", chap: "peatükki", pages: "lehekülge", pdf: "Allalaaditav PDF", toc: "Sisukord" },
  },
  lv: {
    fr: "letton",
    ai: "Šis ceļvedis ir uzrakstīts ar mākslīgā intelekta rīku palīdzību, pēc tam autors to ir pārskatījis un rediģējis.",
    health: "Šis ceļvedis ir paredzēts tikai informatīviem un izglītojošiem nolūkiem. Tas neaizstāj ārsta, dietologa vai cita veselības speciālista padomu, diagnozi vai ārstēšanu. Pirms sāc treniņu programmu vai maini uzturu, konsultējies ar speciālistu, īpaši ja esi stāvoklī, tev ir veselības problēmas vai lieto medikamentus. Rezultāti atšķiras un nav garantēti.",
    finance: "Šis ceļvedis ir paredzēts tikai informatīviem un izglītojošiem nolūkiem un nav individuāls finanšu, nodokļu vai ieguldījumu padoms. Jebkurš ieguldījums ir saistīts ar kapitāla zaudēšanas risku. Iepriekšējie rezultāti negarantē nākotnes rezultātus. Nekādi ienākumi vai peļņa nav garantēti. Izpēti pats un vajadzības gadījumā konsultējies ar licencētu speciālistu.",
    legal: "Šis ceļvedis ir paredzēts tikai informatīviem nolūkiem un nav juridisks padoms. Noteikumi mainās un ir atkarīgi no tavas situācijas un valsts: pārbaudi informāciju oficiālos avotos vai pie jurista.",
    thumb: { kicker: "Pilnais ceļvedis", chap: "nodaļas", pages: "lappuses", pdf: "Lejupielādējams PDF", toc: "Saturs" },
  },
  lt: {
    fr: "lituanien",
    ai: "Šis vadovas parašytas naudojant dirbtinio intelekto įrankius, o vėliau autoriaus peržiūrėtas ir suredaguotas.",
    health: "Šis vadovas skirtas tik informavimo ir švietimo tikslams. Jis nepakeičia gydytojo, dietologo ar kito sveikatos specialisto patarimo, diagnozės ar gydymo. Prieš pradėdamas treniruočių programą ar keisdamas mitybą, pasitark su specialistu, ypač jei esi nėščia, turi sveikatos problemų ar vartoji vaistus. Rezultatai skiriasi ir nėra garantuoti.",
    finance: "Šis vadovas skirtas tik informavimo ir švietimo tikslams ir nėra asmeninė finansinė, mokestinė ar investicinė konsultacija. Bet kokia investicija susijusi su kapitalo praradimo rizika. Ankstesni rezultatai negarantuoja būsimų. Jokios pajamos ar pelnas negarantuojami. Pasidomėk pats ir, jei reikia, pasitark su licencijuotu specialistu.",
    legal: "Šis vadovas skirtas tik informavimo tikslams ir nėra teisinė konsultacija. Taisyklės keičiasi ir priklauso nuo tavo padėties bei šalies: patikrink informaciją oficialiuose šaltiniuose arba pas teisininką.",
    thumb: { kicker: "Išsamus vadovas", chap: "skyriai", pages: "puslapiai", pdf: "PDF atsisiuntimui", toc: "Turinys" },
  },
};

export const contentLang = (code: string) => CONTENT_LANGS[code] || CONTENT_LANGS.en;
export const CONTENT_LANG_CODES = Object.keys(CONTENT_LANGS) as [string, ...string[]];
