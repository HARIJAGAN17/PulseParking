@echo off
if not defined JAVA_HOME (
    set "JAVA_HOME=C:\Program Files\Java\jdk-21.0.10"
)
set "MAVEN_HOME=%~dp0.tools\maven"
"%MAVEN_HOME%\bin\mvn.cmd" %*

