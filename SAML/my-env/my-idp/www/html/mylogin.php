<?php

main();

/**
 * main function.
 *
 */
function main()
{
    $base64_saml_request = $_GET['SAMLRequest'];
    $deflate_saml_request = base64_decode($base64_saml_request);
    $saml_request = gzinflate($deflate_saml_request);
    $printable_saml_request = htmlspecialchars($saml_request, ENT_QUOTES, "UTF-8");

    print "<html>\n";
    print "<body>\n";
    print "<div style=\"background-color:skyblue;\"><center>my SAML IdP</center></div>\n";
    print "<hr/>\n";
    print "<form action='mysaml.php' method='POST'>\n";
    print "<input type='hidden' name='SAMLRequest' value='$base64_saml_request'>\n";
    print "User: ";
    print "<input type='text' name='user' value=''>  <font color=\"red\">&lt;--- input your user_id</font><br/>\n";
    print "<input type='submit' value='go'>\n";
    print "<br/><br/>\n"; 
    print "<hr/>\n";
    print "SAML Request<br/>\n"; 
    print "<textarea style=\"width:99%; height:30%\" autocorrect=\"off\">\n";
    print "$printable_saml_request\n"; 
    print "</textarea>\n";
    print "</form>\n";
    print "</body>\n";
    print "</html>\n";
}

?>
