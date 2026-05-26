def check_demo_config_on_pr():
    from infrastructure.config import config
    assert 'backend_url' not in config['environment']['demo']
    assert ('time-to-live-hours',
            '72') in config['environment']['demo']['tags']
    assert ('turn-off-on-friday-night',
            'yes') in config['environment']['demo']['tags']
    assert ('time-to-live-hours',
            '24') in config['environment']['staging']['tags']
    assert ('time-to-live-hours',
            '24') in config['environment']['sandbox']['tags']
    assert ('time-to-live-hours',
            '24') not in config['environment']['dev']['tags']
    assert ('time-to-live-hours',
            '24') not in config['environment']['production']['tags']


if __name__ == '__main__':
    check_demo_config_on_pr()
