BEGIN {
    PermitRootLogin = "no";
    ChallengeResponseAuthentication = "no";
    PasswordAuthentication = "no";
    AllowTcpForwarding = "no";
    X11Forwarding = "no";
    AllowGroups = "git";
    LogLevel = "VERBOSE";

    FoundPermitRootLogin = 0;
    FoundChallengeResponseAuthentication = 0;
    FoundPasswordAuthentication = 0;
    FoundAllowTcpForwarding = 0;
    FoundX11Forwarding = 0;
    FoundLogLevel = 0;
}
{
    if($1 == "PermitRootLogin") {
        $2 = PermitRootLogin;
        FoundPermitRootLogin = 1;
    } else if($1 == "ChallengeResponseAuthentication") {
        $2 = ChallengeResponseAuthentication;
        FoundChallengeResponseAuthentication = 1;
    } else if($1 == "PasswordAuthentication") {
        $2 = PasswordAuthentication;
        FoundPasswordAuthentication = 1;
    } else if($1 == "AllowTcpForwarding") {
        $2 = AllowTcpForwarding;
        FoundAllowTcpForwarding = 1;
    } else if($1 == "X11Forwarding") {
        $2 = X11Forwarding;
        FoundX11Forwarding = 1;
    } else if($1 == "LogLevel") {
        $2 = LogLevel;
        FoundLogLevel = 1;
    }
    if($1 != "AllowGroups") {
        print $0;
    }
}
END {
    if(!FoundPermitRootLogin) {
        print "PermitRootLogin " PermitRootLogin;
    }
    if(!FoundChallengeResponseAuthentication) {
        print "ChallengeResponseAuthentication " ChallengeResponseAuthentication;
    }
    if(!FoundPasswordAuthentication) {
        print "PasswordAuthentication " PasswordAuthentication;
    }
    if(!FoundAllowTcpForwarding) {
        print "AllowTcpForwarding " AllowTcpForwarding;
    }
    if(!FoundX11Forwarding) {
        print "X11Forwarding " X11Forwarding;
    }
    if(!FoundLogLevel) {
        print "LogLevel " LogLevel;
    }
    print "AllowGroups " AllowGroups;
}
