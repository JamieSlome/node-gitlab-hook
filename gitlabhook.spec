#
# spec file for package nodejs-gitlabhook
#
# Copyright (c) 2014, Rolf Niepraschk, Rolf.Niepraschk@gmx.de
#

%define base_name gitlabhook
Name:           nodejs-%{base_name}
Version:        0.0.11
Release:        4 
Summary:        Hook Server for GitLab
License:        MIT
Group:          Productivity/Networking/Web/Servers
Url:            https://github.com/rolfn/node-gitlab-hook
Source:         gitlabhook-0.0.11.tgz
BuildRequires:  nodejs
Requires:       nodejs
BuildRoot:      %{_tmppath}/%{name}-%{version}-build
BuildArch:      noarch
%define nodejs_sitelib %{_prefix}/lib/node_modules
%description
Hook Server for GitLab

%prep
%setup -q -n package

%build

%install
mkdir -p %{buildroot}%{nodejs_sitelib}/%{base_name}
mkdir -p %{buildroot}%{_sysconfdir}/%{base_name}
mkdir -p %{buildroot}%{_unitdir}
cp -pr package.json gitlabhook.js gitlabhook-server.js node_modules \
        %{buildroot}%{nodejs_sitelib}/%{base_name}/
cp -p %{base_name}.conf %{buildroot}%{_sysconfdir}/%{base_name}/
cp -p %{base_name}.service %{buildroot}%{_unitdir}/

%files
%defattr(-,root,root,-)
%doc README.md LICENSE
%{nodejs_sitelib}/%{base_name}
%{_unitdir}/%{base_name}.service
%config(noreplace) %{_sysconfdir}/%{base_name}/%{base_name}.conf

%changelog
* Thu Oct 09 2014 Rolf.Niepraschk@gmx.de
- initial version 0.0.11
