const BUNDLES = {
    TALEP_BEKLETME_ONAYI: "Talep Bekletme onayı geldi %replace1% geri döndü",
    METIN_BULUNAMADI: "Girilen metin bulunamadı",
    ISTEK_SOTA_SERVERA_GELDI: "İstek sota-server üzerine geldi %replace1% Tarih: %replace2%",
    replace: (text, search, replace) => {
        if (BUNDLES[text]) {
            if ( Array.isArray(search) ) {
                let result = BUNDLES[text].slice();
                search.filter((item, index) => result = result.replace(search[index], replace[index]));
                return result;
            } else return BUNDLES[text].replace(search, replace);
        } else return `${BUNDLES.METIN_BULUNAMADI} ${text}`
    }
}
module.exports = BUNDLES;