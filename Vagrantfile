VAGRANTFILE_API_VERSION = "2"

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|
  config.vm.box       = "saucy64"
  config.vm.box_url   = "http://cloud-images.ubuntu.com/vagrant/saucy/current/saucy-server-cloudimg-amd64-vagrant-disk1.box"
  config.vm.host_name = "myapp-test"
  config.vm.network "forwarded_port", guest:80, host:9000
  config.vm.network "private_network", ip: "192.168.99.99"

  config.vm.provision "ansible" do |ansible|
     ansible.playbook         = "site.yml"
     #ansible.verbose          = "vvvv"
     ansible.inventory_path   = "vagrant_hosts"
     ansible.host_key_checking = false
  end
end

