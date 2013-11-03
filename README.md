# complexity-report

[![Build status][ci-image]][ci-status]

Software complexity analysis for JavaScript projects.
Command-line elder brother of [JSComplexity.org][jscomplexity].

* [Software complexity analysis](#software-complexity-analysis)
* [How it works](#how-it-works)
* [Complexity metrics](#complexity-metrics)
* [What not to do with the results](#what-not-to-do-with-the-results)
* [What to do with the results](#what-to-do-with-the-results)
* [Installation](#installation)
* [Usage](#usage)
    * [Command-line options](#command-line-options)
    * [Output formats](#output-formats)
* [License](#license)

## Software complexity analysis

Complexity is the quality of
consisting of many interrelated parts.
When software consists of many interrelated parts,
it becomes more difficult to reason about.
Software that is difficult to reason about
is a more fertile breeding ground for bugs
than software that is simple.

Every problem space contains some level of inherent complexity,
which is shared by all possible solutions.
However, as programmers,
we can reduce the complexity of our chosen solutions
by limiting the interrelatedness of their constituent components.
This is commonly referred to as favouring cohesion over coupling,
and forms the bedrock on which axioms
such as the single responsibility principle are built.

In codebases that are large and/or unfamiliar,
it can be difficult to know
whether regions of complexity exist
and where they might be.
By defining metrics of complexity,
the search for offending components can be automated
and brought into the existing build process
alongside other forms of static analysis
and unit tests.

## How it works

complexity-report is just
a [node.js][node]-based
command-line wrapper around [escomplex],
which is the library
that performs the actual analysis work.
Code is passed to escomplex
in the form of syntax trees
that have been generated
with [esprima],
a popular JavaScript parser.

[Here is an example report][eg].

## Complexity metrics

The readme for escomplex contains
a [brief overview of the metrics][metrics].

## What not to do with the results

The numbers returned by this tool
should not be interpreted
as definitive indicators
of whether a piece of software
is "too complex",
whatever that might mean.

Software development is a varied field
and every project is subject
to a unique set of environmental factors.
Any attempt to proscribe generic hard limits
for these complexity metrics
is essentially arbitrary
and fails to sufficiently consider
the specific requirements
of a given project.
Further, complexity itself
is such an amorphous, multi-dimensional continuum,
that attempting to pigeon-hole chunks of code
at discrete points along a single axis
is an intrinsically crude approach.

## What to do with the results

It is better to use this tool
as a fuzzy, high-level mechanism,
which can identify regions of interest
or concern
and from which
your own programming- and domain-expertise
can take over
for a more comprehensive analysis.

Although the metrics themselves are not perfect,
they can help to identify areas of code
that warrant closer inspection.
They can also be tracked over time,
as an indicator of the direction
that overall code quality may be moving in.

The tool can be configured to fail
when complexity metrics pass a specified threshold,
to aid its usefulness in automated environments / CI.
There are also options
for controlling how metrics are calculated
and the format of the report output.

## Installation

You must have [node.js installed][nodeinstall].

Then, for a project-based install:

```
npm install complexity-report
```

Or globally for all projects:

```
sudo npm install -g complexity-report
```

## Usage

```
cr [options] <file...>
```

The tool will recursively read files
from any directories that it encounters
automatically.

### Command-line options

Valid options are:

* `-o <file>`: Specify an output file for the report,
  defaults to `stdout`.
* `-f <format>`: Specify an output format for the report,
  defaults to `plain`.
* `-a`: Include hidden files in the report.
* `-p <regex>`: Specify the files to be processed
  using a regular expression to match against file names,
  defaults to `\.js$`.
* `-r <regex>`: Specify the directories to be processed
  using a regular expression to match against directory names,
  defaults to all directories.  Usefull if you want to exclude specific
  directories such as 'node_modules': -r '^((?!node_modules).)*$'
* `-x <number>`: Specify the maximum number of files to open concurrently,
  defaults to `1024`.
* `-m <maintainability>`: Specify the per-module maintainability index threshold
  (below which, the process will fail when exiting).
* `-c <complexity>`: Specify the per-function cyclomatic complexity threshold
  (beyond which, the process will fail when exiting).
* `-d <difficulty>`: Specify the per-function Halstead difficulty threshold
  (beyond which, the process will fail when exiting).
* `-v <volume>`: Specify the per-function Halstead volume threshold
  (beyond which, the process will fail when exiting).
* `-e <effort>`: Specify the per-function Halstead effort threshold
  (beyond which, the process will fail when exiting).
* `-s`: Silences the console output.
* `-l`: Disregards operator `||` as a source of cyclomatic complexity.
* `-w`: Disregards `switch` statements as a source of cyclomatic complexity.
* `-i`: Treats `for`...`in` loops as a source of cyclomatic complexity.
* `-t`: Treats `catch` clauses as a source of cyclomatic complexity.
* `-n`: Uses the [Microsoft-variant maintainability index][msvariant].

### Output formats

Currently there are five output formats supported:
`plain`,
`markdown`,
`minimal`,
`json`,
and `xml`.
These are loaded
from the `src/formats` subdirectory.
If the format file is not found
in that directory,
a second attempt will be made to load the module
without the subdirectory prefix,
more easily enabling the use of
custom formats if so desired.

Adding new formats is simple;
each one must be a CommonJS module,
which exports a function named `format`.
The `format` function
should take a report object,
as [defined by escomplex][format],
and return its string
representation of the report.

See `src/formats/plain.js`
for an example format.

## Development

See the [contribution guidelines][contributions].

## License

[MIT][license]

[ci-image]: https://secure.travis-ci.org/philbooth/complexity-report.png?branch=master
[ci-status]: http://travis-ci.org/#!/philbooth/complexity-report
[jscomplexity]: http://jscomplexity.org/
[node]: http://nodejs.org/
[escomplex]: https://github.com/philbooth/escomplex
[esprima]: http://esprima.org/
[eg]: https://github.com/philbooth/complexity-report/blob/master/SELF.md
[metrics]: https://github.com/philbooth/escomplex/blob/master/README.md#metrics
[nodeinstall]: http://nodejs.org/download
[msvariant]: http://blogs.msdn.com/b/codeanalysis/archive/2007/11/20/maintainability-index-range-and-meaning.aspx
[format]: https://github.com/philbooth/escomplex/blob/master/README.md#result
[contributions]: https://github.com/philbooth/blob/master/CONTRIBUTING.md
[license]: https://github.com/philbooth/complexity-report/blob/master/COPYING

