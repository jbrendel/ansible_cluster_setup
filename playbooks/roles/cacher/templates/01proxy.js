Acquire::http::Proxy "http://{{ hostvars[inventory_hostname][eth_interface]['ipv4']['address'] }}:{{ cache.apt_cache_port }}";
