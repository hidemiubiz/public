<?php

require_once '/var/www/html/vendor/lightsaml/lightsaml/autoload.php';


$IDP="http://localhost:8080/";
$SP="http://localhost:8000/wp-content/plugins/miniorange-saml-20-single-sign-on/";
$SP_DESTINATION="http://localhost:8000";
$SP_BASE="http://localhost:8000/wp-admin/";  // リダイレクト先
$SP_URL="http://localhost:8000/wp-admin/"; // これはSP_DESTINATIONと同じでも違ってもOK?
$COMMON_NAME="123";
$MY_PUBLIC_KEY="my.crt";
$MY_PRIVATE_KEY="my.key";


main();


/**
 * main function.
 *
 */
function main()
{
    $user = $_POST["user"];
    $saml_request = $_POST['SAMLRequest'];

    // base64 +deflate decode
    $d1 = base64_decode($saml_request);
    $d2 = gzinflate($d1);
    $xml = simplexml_load_string($d2);

    // SAMLResponseを生成する
    $saml_response = create_saml_response($user, $xml);

    // Base64でencodeする
    $saml_response_base64 = base64_encode($saml_response);

    // HTMLを生成する
    output_html($user, $saml_response, $saml_response_base64);
}


/**
 * Create SAMLResponse
 *
 * @param  string $user ..... ログインユーザ名
 * @param  string $xml ...... SAMLRequestの XML 文字列
 * @return string SAMLResponse xml string.
 */
function create_saml_response($user, $xml)
{
    global $IDP,$SP,$SP_DESTINATION,$SP_BASE,$SP_URL,$COMMON_NAME, $MY_PUBLIC_KEY, $MY_PRIVATE_KEY;

    $ID_OF_THE_AUTH_REQUEST = $xml->attributes()->ID;

    $response = new \LightSaml\Model\Protocol\Response();
    $response
        ->addAssertion($assertion = new \LightSaml\Model\Assertion\Assertion())
        ->setStatus(new \LightSaml\Model\Protocol\Status(new \LightSaml\Model\Protocol\StatusCode(\LightSaml\SamlConstants::STATUS_SUCCESS)))
        ->setID(\LightSaml\Helper::generateID())
        ->setIssueInstant(new \DateTime())
        ->setDestination($SP_DESTINATION)
        ->setIssuer(new \LightSaml\Model\Assertion\Issuer($IDP));

    $assertion
        ->setId(\LightSaml\Helper::generateID())
        ->setIssueInstant(new \DateTime())
        ->setIssuer(new \LightSaml\Model\Assertion\Issuer($IDP))
        ->setSubject(
            (new \LightSaml\Model\Assertion\Subject())
                ->setNameID(new \LightSaml\Model\Assertion\NameID($user, \LightSaml\SamlConstants::NAME_ID_FORMAT_EMAIL))
                //->setNameID(new \LightSaml\Model\Assertion\NameID($user, \LightSaml\SamlConstants::NAME_ID_FORMAT_UNSPECIFIED))
                ->addSubjectConfirmation(
                    (new \LightSaml\Model\Assertion\SubjectConfirmation())
                        ->setMethod(\LightSaml\SamlConstants::CONFIRMATION_METHOD_BEARER)
                        ->setSubjectConfirmationData(
                            (new \LightSaml\Model\Assertion\SubjectConfirmationData())
                                ->setInResponseTo("$ID_OF_THE_AUTH_REQUEST")
                                ->setNotOnOrAfter(new \DateTime('+1 MINUTE'))
                                ->setRecipient($SP)
                        )
               )
        )
        ->setConditions(
            (new \LightSaml\Model\Assertion\Conditions())
                ->setNotBefore(new \DateTime())
                ->setNotOnOrAfter(new \DateTime('+1 MINUTE'))
                ->addItem(
                    new \LightSaml\Model\Assertion\AudienceRestriction(["$SP"])
                )
        )
        ->addItem(
            (new \LightSaml\Model\Assertion\AttributeStatement())
                ->addAttribute(new \LightSaml\Model\Assertion\Attribute(\LightSaml\ClaimTypes::EMAIL_ADDRESS, $user))
                ->addAttribute(new \LightSaml\Model\Assertion\Attribute(\LightSaml\ClaimTypes::COMMON_NAME, $COMMON_NAME))
                ->addAttribute(new \LightSaml\Model\Assertion\Attribute("http://schemas.microsoft.com/idetify/claims/objectidentifier", $user))
        )
        ->addItem(
            (new \LightSaml\Model\Assertion\AuthnStatement())
                ->setAuthnInstant(new \DateTime('-10 MINUTE'))
                ->setSessionIndex('_some_session_index')
                ->setAuthnContext(
                    (new \LightSaml\Model\Assertion\AuthnContext())
                        ->setAuthnContextClassRef(\LightSaml\SamlConstants::AUTHN_CONTEXT_PASSWORD_PROTECTED_TRANSPORT)
                )
        );

    // 証明書を読み込み
    $certificate = \LightSaml\Credential\X509Certificate::fromFile($MY_PUBLIC_KEY);
    $privateKey = \LightSaml\Credential\KeyHelper::createPrivateKey($MY_PRIVATE_KEY, '', true);

    // 署名
    $response->setSignature(new \LightSaml\Model\XmlDSig\SignatureWriter($certificate, $privateKey));

    // XML表示
    $serializationContext = new \LightSaml\Model\Context\SerializationContext();
    $response->serialize($serializationContext->getDocument(), $serializationContext);

    $result_xml = $serializationContext->getDocument()->saveXML();

    return $result_xml;
}


/**
 * Output HTML
 *
 * @param  string $saml_response .......... SAMLResponseのXML
 * @param  string $saml_response_base64 ... Base64でエンコードされたSAMLResponse
 */
function output_html($user_id, $saml_response, $saml_response_base64)
{
    global $SP_BASE,$SP_URL;

    $saml_response = htmlspecialchars($saml_response, ENT_QUOTES, "UTF-8");

    print "<html>\n";
    print "<body>\n";
    print "<div style=\"background-color:skyblue;\"><center>my SAML IdP</center></div>\n";
    print "<hr/>\n";
    print "<form action='$SP_URL' name='form' method='POST'>\n";
    print "<input type='hidden' name='SAMLResponse' value='$saml_response_base64'>\n";
    print "<input type='hidden' name='RelayState' value='$SP_BASE'>\n";
    print "LOGIN YOUR SP.<br/>USER ... $user_id &nbsp;&nbsp;&nbsp;\n";
    print "<input type='submit' value='GO'>\n";
    print "</form>\n";
    print "<hr/>\n";
    print "<br/>\n";
    print "SAML Response<br/>\n";
    print "<textarea style=\"width:99%; height:50%;\" autocorrect=\"off\">\n";
    print "$saml_response";
    print "</textarea>\n";
    print "<br/>\n";
    print "</body>\n";
    print "</html>\n";
}



?>