# Rolf Niepraschk, 2014-10-10, Rolf.Niepraschk@gmx.de

MAIN = gitlabhook
VERSION = $(shell awk -F '["]' '/version/ {print $$4}' package.json)
SPEC_FILE = $(MAIN).spec
SOURCE = $(MAIN)-$(VERSION).tgz

ECHO = @echo -e

rpm : clean $(SPEC_FILE)
	rm -rf package
	mkdir package
	cp -p gitlabhook-server.js package/
	cp -p gitlabhook.js package/
	cp -p gitlabhook.conf package/
	cp -p README.md package/
	cp -p LICENSE package/
	cp -p package.json package/
	cp -p gitlabhook.service package/
	( cd package/ && npm install )
	tar cvzf $(SOURCE) $(SPEC_FILE) package/
	rpmbuild -ta $(SOURCE)
	rm -rf package/

clean :
	rm -rf $(SOURCE) package/

