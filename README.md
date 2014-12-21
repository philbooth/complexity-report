# complexity-report

Software complexity analysis for JavaScript projects.
Command-line front-end for [escomplex].
Less attractive elder brother of [JSComplexity.org][jscomplexity].

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
the popular JavaScript parser.

[Here is an example report][eg].

## Complexity metrics

The readme for escomplex contains
a [brief overview of the metrics][metrics]
it produces.

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
Attempts to set generic hard limits
for these complexity metrics
must essentially be arbitrary
and fail to consider
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
cr [options] <path>
```

The tool will recursively read files
from any directories that it encounters
automatically.

### Command-line options

```
-h, --help                            output usage information
-c, --config <path>                   specify a configuration JSON file
-o, --output <path>                   specify an output file for the report
-f, --format <format>                 specify the output format of the report
-a, --allfiles                        include hidden files in the report
-p, --filepattern <pattern>           specify the files to process using a regular expression to match against file names
-P, --dirpattern <pattern>            specify the directories to process using a regular expression to match against directory names
-m, --maxfiles <number>               specify the maximum number of files to have open at any point
-F, --maxfod <first-order density>    specify the per-project first-order density threshold
-O, --maxcost <change cost>           specify the per-project change cost threshold
-S, --maxsize <core size>             specify the per-project core size threshold
-M, --minmi <maintainability index>   specify the per-module maintainability index threshold
-C, --maxcyc <cyclomatic complexity>  specify the per-function cyclomatic complexity threshold
-Y, --maxcycden <cyclomatic density>  specify the per-function cyclomatic complexity density threshold
-D, --maxhd <halstead difficulty>     specify the per-function Halstead difficulty threshold
-V, --maxhv <halstead volume>         specify the per-function Halstead volume threshold
-E, --maxhe <halstead effort>         specify the per-function Halstead effort threshold
-s, --silent                          don't write any output to the console
-l, --logicalor                       disregard operator || as source of cyclomatic complexity
-w, --switchcase                      disregard switch statements as source of cyclomatic complexity
-i, --forin                           treat for...in statements as source of cyclomatic complexity
-t, --trycatch                        treat catch clauses as source of cyclomatic complexity
-n, --newmi                           use the Microsoft-variant maintainability index (scale of 0 to 100)
```

### Configuration files

By default,
complexity-report will attempt
to read configuration options
from a JSON file
called `.complexrc`
in the current working directory.
This file should contain
a JSON object
with property names
matching the long-form
option names
from the command line
(the ones that follow `--`).
Options set in this file
will be over-ridden
by options specified
on the command line.

See an [example configuration file][egconfig].

You can also specify
an alternative path
to this file
using the `-c`
command-line option.

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

See [the plain formatter][plain]
for an example.

## Development

See the [contribution guidelines][contributions].

## License

[MIT][license]

[ci-image]: https://secure.travis-ci.org/philbooth/complexity-report.png?branch=master
[ci-status]: http://travis-ci.org/#!/philbooth/complexity-report
[escomplex]: https://github.com/philbooth/escomplex
[jscomplexity]: http://jscomplexity.org/
[node]: http://nodejs.org/
[esprima]: http://esprima.org/
[eg]: https://github.com/philbooth/complexity-report/blob/master/EXAMPLE.md
[metrics]: https://github.com/philbooth/escomplex/blob/master/README.md#metrics
[nodeinstall]: http://nodejs.org/download
[egconfig]: https://github.com/philbooth/complexity-report/blob/master/.complexrc.example
[format]: https://github.com/philbooth/escomplex/blob/master/README.md#result
[plain]: https://github.com/philbooth/complexity-report/blob/master/src/formats/plain.js
[contributions]: https://github.com/philbooth/complexity-report/blob/master/CONTRIBUTING.md
[license]: https://github.com/philbooth/complexity-report/blob/master/COPYING

