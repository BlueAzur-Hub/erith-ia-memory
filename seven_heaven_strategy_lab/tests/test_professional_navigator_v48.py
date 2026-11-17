from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]


class ProfessionalNavigatorV48(unittest.TestCase):
    def test_market_library_and_context_help_are_visible_contracts(self):
        html = (ROOT / 'web/index.html').read_text(encoding='utf-8')
        html_lower = html.lower()
        for text in (
            'BIBLIOTHÈQUE DE MARCHÉS', 'Historiques disponibles',
            'Crypto', 'Plateforme', 'Résolution', 'BIBLIOTHÈQUE DE STRATÉGIES',
            'id="labHelpToggle"', 'aria-label="Activer l’aide contextuelle globale du Strategy Lab"'
        ):
            self.assertIn(text, html)
        self.assertNotIn('class="context-help"', html)
        for dom_id in (
            'market-library-list', 'market-library-count', 'market-library-range',
            'guided-source-tech', 'guided-atlas-definition', 'guided-atlas-how',
            'guided-atlas-family', 'guided-atlas-params', 'glossary-panel'
        ):
            self.assertIn(f'id="{dom_id}"', html)

    def test_strategy_atlas_explains_each_native_method(self):
        from src.strategy_atlas import catalog
        entries = catalog()['entries']
        self.assertGreaterEqual(len(entries), 8)
        for entry in entries:
            for key in ('family_label', 'definition', 'how_it_works', 'regime', 'weakness', 'parameter_note'):
                self.assertTrue(entry.get(key), f'{entry["atlas_id"]}: missing {key}')

    def test_browser_renders_human_source_labels_and_technical_details_separately(self):
        app = (ROOT / 'web/app.js').read_text(encoding='utf-8')
        self.assertIn('coverageLabel(source)', app)
        self.assertIn('certificationLabel(source.integrity?.status)', app)
        self.assertIn('Détails techniques', (ROOT / 'web/index.html').read_text(encoding='utf-8'))
        self.assertIn('StrategySpec', (ROOT / 'web/index.html').read_text(encoding='utf-8'))
        self.assertIn('fichier de sauvegarde portable', (ROOT / 'web/index.html').read_text(encoding='utf-8').lower())


if __name__ == '__main__':
    unittest.main()
