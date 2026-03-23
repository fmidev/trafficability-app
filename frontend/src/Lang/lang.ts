// Purpose: This file contains the language translations for the application.
export const lang = {
  fi: {
    info: {
      header: "Lisätietoja",
      body: [
        {
          text: `Vettä kengässä! on kaikille luonnossa liikkujille suunnattu palvelu, 
            oli kulkuvälineenä sitten saappaat, mönkijä, metsäkone tai muu. 
            Maaston kosteus vaikuttaa kulkukelpoisuuteen: pehmeä tai vetinen maa voi 
            hidastaa kulkua, vaikeuttaa työtä ja pakottaa poikkeamaan reitiltä. 
            Sovelluksessa voit ottaa kuvan maastosta ja kengänpohjastasi, 
            antaa oman arviosi kosteustasosta ja lähettää havaintosi palveluun. 
            Näin kerättyjä havaintoja hyödynnetään sovelluksen kosteusennusteiden tarkkuuden arvioinnissa, jolloin parempia arvioita voidaan kehittää.`,
          markdown: false
        },
        {
          text: `Maaston kosteus/kuivuus ei vaikuta ainoastaan kulkukelpoisuuteen. 
            Arktiset maastopalot ovat todellinen ja ajankohtainen uhka, 
            eivät enää tulevaisuuden haaste. Maastopalot voivat tuhota 
            laajoja maa-alueita ja aiheuttaa merkittävää vahinkoa paikalliselle 
            ekosysteemille ja yhteisöille. Vettä kengässä! -sovelluksen avulla kerätyt havainnot maaston kosteudesta auttavat ennakoimaan paloherkkyyttä ja tukevat varautumista, kun kuivuusriski kasvaa. Jokainen havainto auttaa rakentamaan tarkempaa kuvaa maaston kosteuden vaihteluista ja siitä, missä paloriskit ovat suurimmillaan. Tällä tiedolla on suuri merkitys Arktisten alueiden suojelussa, 
            ja jokainen havaitsija voi osaltaan olla mukana luomassa kestävämpää tulevaisuutta.`,
          markdown: false
        },
        {
          text: "Palvelu on osa Ulkoministeriön rahoittamaa IBA Arktisen maaston paloherkkyys -hankkeen kehitystyötä, jonka tavoitteena on parantaa ja tehostaa maastopaloihin varautumista Arktisella alueella. Lisätietoja palvelusta ja hankkeesta:  [vettakengassa@fmi.fi](mailto:vettakengassa@fmi.fi)",
          markdown: true
        },
        {
          text: '**Vettä kengässä? -sovelluksen käyttö ilman internetyhteyttä**',
          markdown: true
        },
        {
          text: 'Jos olet menossa alueelle, jossa ei ole toimivaa internetyhteyttä, voit silti käyttää Vettä kengässä? -sovellusta jättääksesi havainnon. Toimi näin:',
          markdown: true
        },
        {
          text: 
          'Ennen kuin menet havaintopaikalle:\n' +
          '*   Avaa sovellus ja lataa kartta.\n' +
          '*   Varmista, että koko suunnittelemasi reitti näkyy sovelluksen kartalla.\n' +
          '*   Esiladatut karttatiilet toimivat ilman internetyhteyttä.\n' +
          '*   Anna puhelimen kamerasovellukselle lupa käyttää sijaintiasi.\n',
          markdown: true
        },
        {
          text: 
          'Havaintopaikassa:\n' +
          '*   Merkitse havaintopaikka kartalle.\n' +
          '*   Tarkista, näyttääkö sovelluksen paikannus oikean sijainnin.\n' +
          '*   Siirrä karttaa tarvittaessa oikeaan sijaintiin.\n',
          markdown: true
        },
        {
          text: 
          'Ota kuva havainnosta:\n' +
          '*   Kuvaa maaston kosteustilanne puhelimen kameratoiminnolla.    \n' +
          '*   Kuvan aikaleima auttaa jälkikäteen määrittämään havaintohetken.\n' +
          '*   Kuvan sijaintitieto auttaa jälkikäteen määrittämään havaintopaikan.\n',
          markdown: true
        },
        {
          text: 
          'Täytä lomake:\n' +
          '*   Kirjaa havaintosi lomakkeelle.\n' +
          '*   Pidä lomake avoinna sovelluksessa – voit lähettää sen, kun saat internetyhteyden.\n' +
          '\n',
          markdown: true
        }
      ]
    },
    mainTitle: {
      header: "Vettä kengässä? Maaston kosteus ja kulkukelpoisuus",
    },
    mapTexts: {
      header: "Havainnon sijainti",
      subHeader: "Valitse kartalta havainnon sijainti",
      mapInfoText: "Vihje: Tämä kysymys yrittää käyttää sijaintiasi. Paina, jos haluat jatkaa."
    },
    examplePictureText: {
      header: "Kuva jäljestä"
    },
    fileField: {
      text: "Pudota tai valitse kuva"
    },
    soilMoisture: {
      header: "Maaston kosteus",
      options: [
        "Erittäin kuiva",
        "Kuiva",
        "Kostea",
        "Märkä",
        "Erittäin märkä"
      ],
      moreInfo: {
        "Erittäin kuiva": {
          label1: `<strong>Jälki:</strong> Kasvipeitteisessä maastossa selvä jälki, kasvillisuus rikkoutuu.
          <ul class="indented">
            <li>Jäkäläkankaalla: Selvä jälki, jäkälä murenee <strong>HUOM!</strong> poronhoitoaluella jäkälä lyhyttä/jäkäläpeite ohut.</li>
            <li>Turvekankaalla: Selvä jälki, rahkasammal katkeilee.</li>
            <li>Jos kasvillisuutta ei ole, ei näkyvää jälkeä.</li>
          </ul>`,
          label2: `<strong>Ääni:</strong> kasvillisuus rapisee askelten alla.`,
          label3: `<strong>Kasvillisuuden/maan tarttuvuus:</strong> Kasvillisuutta/maata ei tartu kenkiin.`,
          label4: `<strong>Jäljen kiilto:</strong> Ei kiiltoa, maa näyttää pölyiseltä.`
        },
        "Kuiva": {
          label1: `<strong>Jälki:</strong> Kasvipeitteisessä maastossa selvä jälki, kasvillisuus ei rikkoonnu.
        <ul class="indented">
          <li>Jos kasvillisuutta ei ole, ei näkyvää jälkeä.</li>
        </ul>`,
          label2: `<strong>Kasvillisuuden/maan tarttuvuus:</strong> Vähän kasvillisuutta/maata voi tarttua kenkiin.`,
          label3: `<strong>Jäljen kiilto:</strong> Ei kiiltoa, maa näyttää mattapintaiselta.`
        },
        "Kostea": {
          label1: `<strong>Jälki:</strong> Jää hetkellinen jälki, mutta kasvillisuus palautuu omaan muotoonsa, koska kasvillisuudessa on kosteutta.`,
          label2: `<strong>Kasvillisuuden/maan tarttuvuus:</strong> Jonkin verran kasvillisuutta/maata tarttuu kenkiin.`,
          label3: `<strong>Jäljen kiilto:</strong> Hieman kiiltoa, maa näyttää hieman kiiltävältä.`
        },
        "Märkä": {
          label1: `<strong>Jälki:</strong> Astuessasi märkään maahan, vettä tulee esiin kasvillisuuden lomasta.`,
          label2: `<strong>Kasvillisuuden/maan tarttuvuus:</strong> Merkittävä määrä kasvillisuutta/maata tarttuu kenkiin.`,
          label3: `<strong>Jäljen kiilto:</strong> Huomattava kiilto, maa näyttää märältä.`
        },
        "Erittäin märkä": {
          label1: `<strong>Jälki:</strong>  Astuessasi maahan jälki täytyy vedellä.`,
          label2: `<strong>kasvillisuuden/maan tarttuvuus:</strong> Suuri määrä kasvillisuutta/maata tarttuu kenkiin.`,
          label3: `<strong>Jäljen kiilto: </strong> Korkea kiilto, maa näyttää erittäin märältä ja voi olla lätäköitä.`
        }
      },
    },
    commentComponent: {
      header: "Osallistu kilpailuun",
      subHeaderText: "Jätä nimimerkki.",
    },
    certaintyOfObservationAssessment: {
      header: "Havainnon varmuus",
      options: [
        "Epävarma",
        "Melko varma",
        "Varma"
      ]
    },
    checkboxComponent: {
      text: "Suostun havaintoni julkaisuun.",
      readMore: "Lue lisää",
      modalContent: {
        header: "Käyttöehdot",
        body: [
          {
            heading: "Hyväksyntä",
            content:
              "Tämän palvelun käyttäminen edellyttää näiden käyttöehtojen hyväksymistä kaikissa niiden osioissa sekä mahdollisissa muutoksissa tai päivityksissä, joita Ilmatieteen laitos voi tehdä. Jos et hyväksy näitä käyttöehtoja, älä käytä palvelua."
          },
          {
            heading: "Käyttölupa",
            content: "Meillä on oikeus tarjota sinulle maastokarttoja Maaston Kulkukelpoisuus -palvelumme kautta tiettyjen sivustojemme ja sovellustemme välityksellä. Tämä lupa ei ole myyntilupa, vaan se sisältää oikeuden käyttää palvelua yksinomaan sallittuihin tarkoituksiin, kuten tiedottamaan kulkukelpoisuudesta ja pyytämään sinulta arviota kokemistasi olosuhteista."
          },
          {
            heading: "Käytön ehdot",
            content: "Voit käyttää palvelua vain ei-personoituna käyttäjänä, joka hyväksyy nämä käyttöehdot palvelua käyttäessään. Älä käytä palvelua lainvastaisiin tarkoituksiin tai tavalla, joka rikkoo sovellettavia lakeja tai säädöksiä."
          },
          {
            heading: "Palveluksen eheys",
            content: "Palvelumme sisältö on tarkoitettu tietojen käyttöön ja arviointiin. Kaikki palvelun sisällön käyttö ja jakelu rajoittuu suoraan tietoja sisältävien tuotteiden, kuten karttatietojen, ja niiden arviointiin tarkoitettujen sovellusten käyttöön."
          },
          {
            heading: "Tekijänoikeudet",
            content: "Palvelumme sisältö on tekijänoikeussuojattua. Voit käyttää sitä sallittujen ehtojen mukaisesti. Kaikki oikeudet palvelumme sisältöön ja siihen liittyviin materiaaleihin kuuluvat Ilmatieteen laitokselle. Lisenssi on Creative Commons v4 BY, eli jos käytät tietoja edelleen, sinun on mainittava Ilmatieteen laitos lähteenä."
          },
          {
            heading: "Maksut",
            content: "Palvelun käyttö on ilmaista, emmekä vastaa tai takaa minkään tiedon oikeellisuutta."
          },
          {
            heading: "Tietosuoja",
            content: "Vältämme henkilötietojen keruuta, mutta pidätämme oikeuden kerätä kuvauslaitteen tietoja kuvien laadun tarkkailua ja eri kuvaajien erittelyä varten. Voit jättää meille nimimerkin, mutta vältä oikean nimesi käyttämistä. Suosittelemme käyttämään samaa nimimerkkiä jatkuvasti, jotta ahkerimmat havainnoijat voidaan tunnistaa ja mahdollisesti palkita."
          },
          {
            heading: "Oikeudelliset säännökset",
            content: "Näiden käyttöehtojen lisäksi sovelletaan voimassa olevia Suomen lakeja."
          },
          {
            heading: "Muutokset",
            content: "Pidätämme oikeuden päivittää käyttöehtoja milloin tahansa. Käyttämällä palvelua päivitysten jälkeen hyväksyt automaattisesti uudet ehdot."
          },
          {
            heading: "Yhteystiedot",
            content: "Jos sinulla on kysymyksiä tai huolenaiheita näiden käyttöehtojen osalta, ota yhteyttä sähköpostitse:"
          }
        ]
      }
    },
    errorMessages: {
      position: "Havainnon sijainti vaaditaan.",
      pictureField: "Kuva jäljestä pakollinen tieto.",
      answerField: "Maaston kosteus puuttuu.",
      evaluteAnswer: "Havainnon varmuus puuttuu.",
      checkbox: "Tietosuojaselosteen hyväksyminen vaaditaan.",
      offline: "Verkkoyhteyttä ei ole.",
      error: "Virhe"
    },
    sendButton: {
      text: "Lähetä"
    },
    responseSaved: {
      text: "Vastaus tallennettu"
    },
    unknownError: {
      title: "Virhe",
      text: "Tuntematon virhe"
    }
  },
  en: {
    info: {
      header: "More information",
      body: [
        {
          text: 'Water in Your Boots! is a service designed for everyone on the move in nature—whether your means of travel is boots, an ATV, a forestry machine, or something else. The moisture content of the terrain affects its trafficability: soft or waterlogged ground can slow you down, complicate work, and force you off your planned route. With the app, you can snap a photo of the terrain and the sole of your boot, give your assessment of the ground’s wetness, and submit your observation. These observations are then used to evaluate and improve the accuracy of the app’s moisture forecasts to develop better estimates.',
          markdown: false
        },
        {
          text: 'Terrain moisture/dryness affects more than just trafficability. In the Arctic, wildfires have become a pressing and real threat—not just a future challenge. Wildfires can destroy large areas and cause significant damage to local ecosystems and communities. The moisture observations collected via the Water in Your Boots! app help anticipate fire risks and support preparedness efforts as drought conditions worsen. Each observation contributes to a clearer picture of moisture variations across the landscape and pinpoints areas at greatest risk for wildfires. This information is crucial for protecting Arctic regions, and every observer can help build a more sustainable future.',
          markdown: false
        },
        {
          text: 'The service is part of the development work of the IBA Arctic Terrain Fire Susceptibility project, funded by the Ministry for Foreign Affairs. The project aims to improve and strengthen wildfire preparedness in the Arctic. For more information about the service and the project, please contact: [vettakengassa@fmi.fi](mailto:vettakengassa@fmi.fi)',
          markdown: true
        },
        {
          text: '**Using the Water in Your Boot? App Without an Internet Connection**\n',
          markdown: true
        },
        {
          text: 
          'If you\'re heading to an area without a working internet connection, you can still use the Water in Your Boot? app to submit an observation. Here\'s how:\n',
          markdown: true
        },
        {
          text: 
          'Before going to the observation site:\n' +
          '*   Open the app and download the map.\n' +
          '*   Make sure your entire planned route is visible on the app’s map.\n' +
          '*   Preloaded map tiles will work offline.\n' +
          '*   Allow your phone’s camera app to access your location.\n',
          markdown: true
        },
        {
          text: 
          'At the observation site:\n' +
          '*   Mark the observation location on the map.\n' +
          '*   Check if the app shows the correct location.\n' +
          '*   Move the map if necessary to adjust to the correct spot.\n',
          markdown: true
        },
        {
          text: 
          'Take a photo of the observation:\n' +
          '*   Capture the terrain’s moisture condition using your phone’s camera.\n' +
          '*   The photo’s timestamp helps identify when the observation was made.\n' +
          '*   The photo’s location data helps determine where the observation was taken.\n',
          markdown: true
        },
        {
          text: 
          'Fill in the form:\n' +
          '*   Record your observation using the form.\n' +
          '*   Keep the form open in the app—you can submit it once you’re back online.\n',
          markdown: true
        }
      ]
    },
    mainTitle: {
      header:  "Water in Your Boots? Terrain Moisture and Trafficability",
    },
    mapTexts: {
      header: "Observation location",
      subHeader: "Select the observation location on the map",
      mapInfoText: "Hint: This question tries to use your location. Press if you want to continue."
    },
    examplePictureText: {
      header: "Picture of the track"
    },
    fileField: {
      text: "Drop or select a picture"
    },
    soilMoisture: {
      header: "Terrain moisture",
      options: [
        "Very dry",
        "Dry",
        "Moist",
        "Wet",
        "Extremely wet"
      ],
      moreInfo: {
        "Very dry": {
          label1: `<strong>Track:</strong> In vegetated terrain, a clear track is visible, and vegetation breaks.
          <ul class="indented">
            <li>On Lichen Heath: A clear track is visible, and lichen crumbles.<strong> Note:</strong> In reindeer herding areas, lichen is short/thin.</li>
            <li>On Peatland: A clear track is visible, and sphagnum moss breaks.</li>
            <li>If there is no vegetation, no visible track remains.</li>
          </ul>`,
          label2: `<strong>Sound:</strong> Vegetation rustles underfoot.`,
          label3: `<strong>Adhesion of Vegetation/Soil:</strong> No vegetation or soil sticks to shoes.`,
          label4: `<strong>Track Shine:</strong> No shine; the ground looks dusty.`
        },
        "Dry": {
          label1: `<strong>Track:</strong> In vegetated terrain, a clear track is visible, but vegetation does not break.
        <ul class="indented">
          <li>If there is no vegetation, no visible track remains.</li>
        </ul>`,
          label2: `<strong>Adhesion of Vegetation/Soil:</strong>  A small amount of vegetation/soil may stick to shoes.`,
          label3: `<strong>Track Shine:</strong> No shine; the ground looks matte.`
        },
        "Moist": {
          label1: `<strong>Track:</strong> A temporary track remains, but vegetation regains its shape due to moisture.`,
          label2: `<strong>Adhesion of Vegetation/Soil:</strong> Some vegetation/soil sticks to shoes.`,
          label3: `<strong>Track Shine:</strong> Slight shine; the ground looks slightly glossy.`
        },
        "Wet": {
          label1: `<strong>Track:</strong> When stepping on wet ground, water surfaces between the vegetation.`,
          label2: `<strong>Adhesion of Vegetation/Soil:</strong> A significant amount of vegetation/soil sticks to shoes.`,
          label3: `<strong>Track Shine:</strong> Noticeable shine; the ground looks wet.`
        },
        "Extremely wet": {
          label1: `<strong>Track:</strong> When stepping on the ground, the track fills with water.`,
          label2: `<strong>Adhesion of Vegetation/Soil:</strong> A large amount of vegetation/soil sticks to shoes.`,
          label3: `<strong>Track Shine: </strong> High shine; the ground looks very wet and may have puddles.`
        }
      },
    },
    commentComponent: {
      header: "Join the competition",
      subHeaderText: "Leave a nickname.",
    },
    certaintyOfObservationAssessment: {
      header: "Observation certainty",
      options: [
        "Uncertain",
        "Fairly certain",
        "Certain"
      ]
    },
    checkboxComponent: {
      text: "I consent to publishing my observation.",
      readMore: "Read more",
      modalContent: {
        header: "Terms of use",
        body: [
          {
            heading: "Acceptance",
            content: "By using this service, you agree to these terms of use in all their sections, as well as any modifications or updates that the Finnish Meteorological Institute may make. If you do not accept these terms, do not use the service."
          },
          {
            heading: "License to Use",
            content: "We have the right to provide you with topographic maps through our Terrain Accessibility service via certain websites and applications. This permission does not constitute a sales license; rather, it grants you the right to use the service solely for permitted purposes, which include informing you about terrain accessibility and requesting your assessment of the conditions you have experienced."
          },
          {
            heading: "Terms of Use",
            content: "You may only use the service as a non-personalized user who accepts these terms when using the service. Do not use the service for illegal purposes or in a manner that violates any applicable laws or regulations."
          },
          {
            heading: "Integrity of the Service",
            content: "The content of our service is intended for information use and assessment. The use and distribution of all service content are strictly limited to inclusion in products containing data, such as map data and applications used for evaluating these data."
          },
          {
            heading: "Copyright",
            content: "The content of our service is protected by copyright. You may use it in accordance with the permitted conditions. All rights to the licensing of our service content and related materials belong to the Finnish Meteorological Institute. The license follows Creative Commons v4 BY, meaning that if you reuse the data, you are required to credit the Finnish Meteorological Institute as the source."
          },
          {
            heading: "Fees",
            content: "The use of the service is free of charge, and we do not take responsibility for or guarantee the accuracy of any provided information."
          },
          {
            heading: "Privacy Policy",
            content: "We aim to avoid collecting personal data, but we reserve the right to collect information about the recording device to monitor image quality and differentiate between different contributors. You may leave us a nickname, but please avoid using your real name. However, use the same nickname consistently, as it allows us to eventually select a rewarded observer, where diligence will be one of the criteria."
          },
          {
            heading: "Legal Provisions",
            content: "In addition to these terms of use, the applicable laws of Finland shall apply."
          },
          {
            heading: "Changes",
            content: "We reserve the right to update the terms of use at any time. By continuing to use the service after updates, you automatically accept the new terms."
          },
          {
            heading: "Contact Information",
            content: "If you have any questions or concerns regarding these terms of use, please contact us via email at"
          }
        ]
      }
    },
    errorMessages: {
      position: "The location of the observation is required.",
      pictureField: "Picture image is required.",
      answerField: "Soil moisture accessment is required.",
      evaluteAnswer: "Assessment of certainty in my observations is required.",
      checkbox: "Acceptance of the privacy statement is required.",
      offline: "No internet connection.",
      error: "Error"
    },
    sendButton: {
      text: "Send"
    },
    responseSaved: {
      text: "Response saved"
    },
    unknownError: {
      title: "Error",
      text: "Unknown error"
    }
  },
}
