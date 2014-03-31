{% if cache.pkg_cache == "create" %}
Acquire::http::Proxy "http://{{ hostvars[groups['cache'][0]][eth_interface]['ipv4']['address'] }}:{{ cache.apt_cache_port }}";
{% else %}
Acquire::http::Proxy "http://{{ cache.pkg_cache_existing_ip_addr }}:{{ cache.apt_cache_port }}";
{% endif %}
