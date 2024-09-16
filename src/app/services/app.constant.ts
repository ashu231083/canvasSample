export class AppConstant {
  public static App_Constant = {
    //URL: 'http://localhost:8082/Projects/WestHill/Westhill-ePaper/smartpaper/portal-api/index.php?',
    URL: 'https://westhill-epaper.smartrxhub.com/smartpaper/portal-api/index.php?',
    FILE_URL: 'https://westhill-epaper.smartrxhub.com/smartpaper/',
    RESPONSE_YES: 'yes',
    RESPONSE_NO: 'no',
  };

  public static App_Action = {
    GET_PAPERTYPE_VERSION: 'getPaperTypeVersion',
    ADD_BLOCK_AREA_WITH_META:"addBlockAreaWithMeta",
    GET_BLOCK_AREA_META:"getBlockAreaAndMeta",
    DELETE_BLOCK_AREA_WITH_META:"deleteBlockAreaWithMeta"
  };
}
